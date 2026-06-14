import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { HoLinkUser, HoLinkItem } from '@/models'
import { normalizeUrl } from '@/utils/validate-url'
import { detectPlatform, getUrlDomain } from '@/utils/platform'
import { detectDeviceType } from '@/utils/device'
import { generateId } from '@/utils/id'
import {
  findUserByUsername,
  logAnalytics,
  saveSessionUser,
  upsertUser,
  clearSession,
} from '@/stores/holink-storage'
import { useAuthStore } from '@/stores/auth-store'

const SIMULATED_LATENCY_MS = 600

// Profile fields tracked for `changed_fields` analytics diffing.
const TRACKED_PROFILE_FIELDS = ['username', 'displayName', 'bio', 'avatarUrl'] as const

export const useHolinkStore = defineStore('holink', () => {
  const auth = useAuthStore()

  const currentUser = ref<HoLinkUser | null>(null)
  const pendingDeleteIds = ref<Set<string>>(new Set())
  const searchQuery = ref<string>('')

  const sortedLinks = computed<HoLinkItem[]>(() => {
    if (!currentUser.value) return []
    return [...currentUser.value.links].sort((a, b) => a.order - b.order)
  })

  const filteredLinks = computed<HoLinkItem[]>(() => {
    const links = sortedLinks.value
    const query = searchQuery.value.trim().toLowerCase()

    if (query.length === 0) return links

    return links.filter(
      (link) => link.title.toLowerCase().includes(query) || link.url.toLowerCase().includes(query),
    )
  })

  const hasUndoableDelete = computed<boolean>(() => pendingDeleteIds.value.size > 0)

  function saveToStorage(): void {
    if (currentUser.value) {
      saveSessionUser(currentUser.value)
      upsertUser(currentUser.value)
    } else {
      clearSession()
    }
  }

  // ── Queries ─────────
  function isPendingDelete(id: string): boolean {
    return pendingDeleteIds.value.has(id)
  }

  function findLink(id: string): HoLinkItem | undefined {
    return currentUser.value?.links.find((link) => link.id === id)
  }

  // ── Internal helpers ─────────
  function getNextOrder(): number {
    const links = currentUser.value?.links ?? []
    if (links.length === 0) return 0
    return Math.max(...links.map((link) => link.order)) + 1
  }

  function reorderLinks(): void {
    if (!currentUser.value) return
    currentUser.value.links
      .sort((a, b) => a.order - b.order)
      .forEach((link, index) => {
        link.order = index
      })
  }

  function syncCurrentUser(username: string | null): void {
    if (!username) {
      currentUser.value = null
      return
    }

    const existing = findUserByUsername(username)
    if (existing) {
      currentUser.value = existing
      return
    }

    currentUser.value = {
      id: generateId(),
      username,
      displayName: username,
      bio: '',
      password: '',
      links: [],
      updatedAt: new Date().toISOString(),
    }
    saveToStorage()
  }

  // ── Profile ─────────
  async function updateProfile(
    payload: Partial<HoLinkUser>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!currentUser.value) return { success: false, error: 'No user initialized' }

    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

      const { links: _links, ...safeData } = payload

      // Compute changed fields BEFORE applying the update.
      const changedFields: string[] = TRACKED_PROFILE_FIELDS.filter((field) => {
        const oldValue = (currentUser.value as Record<string, unknown>)[field] ?? ''
        const newValue = (safeData as Record<string, unknown>)[field] ?? ''
        return String(oldValue).trim() !== String(newValue).trim()
      })

      const oldUsername = currentUser.value.username
      const newUsername = safeData.username?.trim()

      Object.assign(currentUser.value, safeData)
      currentUser.value.updatedAt = new Date().toISOString()
      saveToStorage()

      if (
        typeof newUsername === 'string' &&
        newUsername.length > 0 &&
        newUsername.toLowerCase() !== oldUsername.toLowerCase()
      ) {
        auth.updateAuthedUsername(currentUser.value.username)
      }

      logAnalytics('profile_saved', {
        username: currentUser.value.username,
        changed_fields: changedFields,
      })

      return { success: true }
    } catch {
      return { success: false, error: 'Failed to save profile.' }
    }
  }

  // ── Links ─────────
  function addLink(title: string, url: string): { success: boolean; error?: string } {
    if (!currentUser.value) return { success: false, error: 'No user initialized' }

    const result = normalizeUrl(url)
    if (!result.isValid) {
      return { success: false, error: result.error }
    }

    const now = new Date().toISOString()
    const newLink: HoLinkItem = {
      id: generateId(),
      title: title.trim(),
      url: url.trim(),
      normalizedUrl: result.normalizedUrl,
      platform: detectPlatform(result.normalizedUrl),
      isActive: true,
      order: getNextOrder(),
      createdAt: now,
      updatedAt: now,
    }

    currentUser.value.links.push(newLink)
    saveToStorage()

    logAnalytics('link_added', {
      link_id: newLink.id,
      platform: newLink.platform,
      url_domain: getUrlDomain(newLink.normalizedUrl),
    })

    return { success: true }
  }

  function updateLink(id: string, data: Partial<HoLinkItem>): void {
    const link = findLink(id)
    if (!link) return

    Object.assign(link, data, { updatedAt: new Date().toISOString() })
    saveToStorage()
  }

  function deleteLink(id: string): void {
    if (!findLink(id)) return
    pendingDeleteIds.value.add(id)
  }

  function undoDelete(id: string): void {
    pendingDeleteIds.value.delete(id)
  }

  function confirmDelete(id: string): void {
    if (!currentUser.value) return

    currentUser.value.links = currentUser.value.links.filter((link) => link.id !== id)
    pendingDeleteIds.value.delete(id)
    reorderLinks()
    saveToStorage()
  }

  function toggleLinkActive(id: string): void {
    const link = findLink(id)
    if (!link) return

    link.isActive = !link.isActive
    link.updatedAt = new Date().toISOString()
    saveToStorage()
  }

  function updateLinksOrder(newLinks: HoLinkItem[]): void {
    if (!currentUser.value) return

    newLinks.forEach((link, index) => {
      const storeLink = currentUser.value?.links.find((l) => l.id === link.id)
      if (storeLink) {
        storeLink.order = index
      }
    })

    saveToStorage()
  }

  function moveLink(id: string, direction: 'up' | 'down'): void {
    if (!currentUser.value) return

    const sorted = [...currentUser.value.links].sort((a, b) => a.order - b.order)
    const currentIndex = sorted.findIndex((l) => l.id === id)
    if (currentIndex === -1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    const currentLink = sorted[currentIndex]
    const swapLink = sorted[swapIndex]
    if (!currentLink || !swapLink) return

    const tempOrder = currentLink.order
    currentLink.order = swapLink.order
    swapLink.order = tempOrder

    saveToStorage()
  }

  // ── Analytics ──────────────────────────────────────────────────────────
  function logLinkClick(username: string, link: HoLinkItem): void {
    logAnalytics('link_clicked', {
      username,
      link_id: link.id,
      platform: link.platform,
    })
  }

  function logProfileView(username: string): void {
    logAnalytics('public_profile_viewed', {
      username,
      device_type: detectDeviceType(),
    })
  }

  // ── Auth sync ──────────────────────────────────────────────────────────
  watch(
    () => auth.authedUsername,
    (username) => syncCurrentUser(username),
    { flush: 'sync', immediate: true },
  )

  return {
    currentUser,
    pendingDeleteIds,
    searchQuery,
    sortedLinks,
    filteredLinks,
    hasUndoableDelete,
    findUserByUsername,
    isPendingDelete,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    undoDelete,
    confirmDelete,
    toggleLinkActive,
    updateLinksOrder,
    moveLink,
    logLinkClick,
    logProfileView,
  }
})
