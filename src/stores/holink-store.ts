import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { HoLinkUser, HoLinkItem } from '@/models'
import { normalizeUrl, detectPlatform, generateId } from '@/utils/link'
import {
  findUserByUsername,
  logAnalytics,
  saveSessionUser,
  upsertUser,
  removeUser,
  clearSession,
} from '@/stores/holink-storage'
import { useAuthStore } from '@/stores/auth-store'

export const useHolinkStore = defineStore('holink', () => {
  const auth = useAuthStore()

  const currentUser = ref<HoLinkUser | null>(null)
  const lastDeletedLink = ref<HoLinkItem | null>(null)
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

  const hasUndoableDelete = computed<boolean>(() => lastDeletedLink.value !== null)

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

    const newUser: HoLinkUser = {
      id: generateId(),
      username,
      displayName: username,
      bio: '',
      password: '',
      links: [],
      updatedAt: new Date().toISOString(),
    }
    currentUser.value = newUser
    persist()
  }

  function getNextOrder(): number {
    if (!currentUser.value || currentUser.value.links.length === 0) return 0
    return Math.max(...currentUser.value.links.map((link) => link.order)) + 1
  }

  function reorderLinks(): void {
    if (!currentUser.value) return
    currentUser.value.links
      .sort((a, b) => a.order - b.order)
      .forEach((link, index) => {
        link.order = index
      })
  }

  function persist(): void {
    if (currentUser.value) {
      saveSessionUser(currentUser.value)
      upsertUser(currentUser.value)
    } else {
      clearSession()
    }
  }

  watch(
    () => auth.authedUsername,
    (username) => syncCurrentUser(username),
    { flush: 'sync', immediate: true },
  )

  async function updateProfile(
    data: Partial<HoLinkUser>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!currentUser.value) return { success: false, error: 'No user initialized' }

    try {
      await new Promise((resolve) => setTimeout(resolve, 400))

      const { links: _links, ...safeData } = data

      const oldUsername = currentUser.value.username
      const newUsername = safeData.username?.trim()
      const isRenaming =
        typeof newUsername === 'string' &&
        newUsername.length > 0 &&
        newUsername.toLowerCase() !== oldUsername.toLowerCase()

      if (isRenaming) {
        removeUser(oldUsername)
      }

      Object.assign(currentUser.value, safeData)
      currentUser.value.updatedAt = new Date().toISOString()
      persist()

      if (isRenaming) {
        auth.updateAuthedUsername(currentUser.value.username)
      }

      logAnalytics('profile_saved', { ...safeData })

      return { success: true }
    } catch {
      return { success: false, error: 'Failed to save profile.' }
    }
  }

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
    persist()
    logAnalytics('link_added', { id: newLink.id, title: newLink.title, url: newLink.normalizedUrl })

    return { success: true }
  }

  function updateLink(id: string, data: Partial<HoLinkItem>): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (!link) return

    Object.assign(link, data, { updatedAt: new Date().toISOString() })
    persist()
  }

  function deleteLink(id: string): void {
    if (!currentUser.value) return

    const index = currentUser.value.links.findIndex((l) => l.id === id)
    if (index === -1) return

    if (lastDeletedLink.value) {
      confirmDelete()
    }

    const removed = currentUser.value.links.splice(index, 1)[0]
    if (!removed) return

    lastDeletedLink.value = removed
    reorderLinks()
    persist()
  }

  function undoDelete(): void {
    if (!currentUser.value || !lastDeletedLink.value) return

    const restored = lastDeletedLink.value
    restored.order = getNextOrder()
    currentUser.value.links.push(restored)
    lastDeletedLink.value = null
    reorderLinks()
    persist()
  }

  function confirmDelete(): void {
    lastDeletedLink.value = null
    persist()
  }

  function toggleLinkActive(id: string): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (!link) return

    link.isActive = !link.isActive
    link.updatedAt = new Date().toISOString()
    persist()
  }

  function updateLinksOrder(newLinks: HoLinkItem[]): void {
    if (!currentUser.value) return

    newLinks.forEach((link, index) => {
      const storeLink = currentUser.value?.links.find((l) => l.id === link.id)
      if (storeLink) {
        storeLink.order = index
      }
    })

    persist()
  }

  function moveLink(id: string, direction: 'up' | 'down'): void {
    if (!currentUser.value) return

    const sorted = [...currentUser.value.links].sort((a, b) => a.order - b.order)
    const currentIndex = sorted.findIndex((l) => l.id === id)
    if (currentIndex === -1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    const currentLink = sorted[currentIndex]!
    const swapLink = sorted[swapIndex]!

    const tempOrder = currentLink.order
    currentLink.order = swapLink.order
    swapLink.order = tempOrder

    persist()
  }

  function logLinkClick(id: string): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (link) {
      logAnalytics('link_clicked', { id: link.id, title: link.title, url: link.normalizedUrl })
    }
  }

  function logProfileView(): void {
    if (!currentUser.value) return
    logAnalytics('public_profile_viewed', { username: currentUser.value.username })
  }

  return {
    currentUser,
    lastDeletedLink,
    searchQuery,
    sortedLinks,
    filteredLinks,
    hasUndoableDelete,
    findUserByUsername,
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
