import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HoLinkUser, HoLinkItem } from '@/types'
import { normalizeUrl, detectPlatform, generateId } from '@/utils/link'

// ─── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'holink_data'
const ANALYTICS_KEY = 'holink_analytics'

// ─── Analytics Types ────────────────────────────────────────────────────────

type AnalyticsEventName = 'profile_saved' | 'link_added' | 'link_clicked' | 'public_profile_viewed'

interface AnalyticsEvent {
  eventName: AnalyticsEventName
  payload: Record<string, unknown>
  timestamp: string
}

// ─── Mock Default Data ──────────────────────────────────────────────────────

function createMockUser(): HoLinkUser {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    username: 'johndoe',
    displayName: 'John Doe',
    bio: 'Welcome to my HoLink page! 🚀',
    avatarUrl: undefined,
    links: [
      {
        id: generateId(),
        title: 'Instagram',
        url: 'https://instagram.com/johndoe',
        normalizedUrl: 'https://instagram.com/johndoe',
        platform: 'instagram',
        isActive: true,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'YouTube Channel',
        url: 'https://youtube.com/@johndoe',
        normalizedUrl: 'https://youtube.com/@johndoe',
        platform: 'youtube',
        isActive: true,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'TikTok',
        url: 'https://tiktok.com/@johndoe',
        normalizedUrl: 'https://tiktok.com/@johndoe',
        platform: 'tiktok',
        isActive: true,
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
    ],
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useHolinkStore = defineStore('holink', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const currentUser = ref<HoLinkUser | null>(null)
  const isLoading = ref<boolean>(false)
  const lastDeletedLink = ref<HoLinkItem | null>(null)
  const searchQuery = ref<string>('')

  // ── Getters ───────────────────────────────────────────────────────────────

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

  // ── Private Helpers (not exposed) ─────────────────────────────────────────

  function saveToStorage(): void {
    if (!currentUser.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value))
    } catch (error) {
      console.error('[HoLink] Failed to save to localStorage:', error)
    }
  }

  function loadFromStorage(): HoLinkUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw) as HoLinkUser
      }
    } catch (error) {
      console.error('[HoLink] Failed to load from localStorage:', error)
    }
    return null
  }

  function logEvent(eventName: AnalyticsEventName, payload: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      eventName,
      payload,
      timestamp: new Date().toISOString(),
    }

    console.log(`[HoLink Analytics] ${event.timestamp} — ${eventName}`, payload)

    try {
      const raw = localStorage.getItem(ANALYTICS_KEY)
      const events: AnalyticsEvent[] = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []
      events.push(event)
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
    } catch (error) {
      console.error('[HoLink] Failed to save analytics event:', error)
    }
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

  // ── Actions ───────────────────────────────────────────────────────────────

  function initialize(): void {
    isLoading.value = true
    try {
      const stored = loadFromStorage()
      currentUser.value = stored ?? createMockUser()
      if (!stored) {
        saveToStorage()
      }
    } finally {
      isLoading.value = false
    }
  }

  function updateProfile(data: Partial<HoLinkUser>): void {
    if (!currentUser.value) return

    // Prevent direct mutation of links through updateProfile
    const { links: _links, ...safeData } = data

    Object.assign(currentUser.value, safeData)
    saveToStorage()
    logEvent('profile_saved', { ...safeData })
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
    saveToStorage()
    logEvent('link_added', { id: newLink.id, title: newLink.title, url: newLink.normalizedUrl })

    return { success: true }
  }

  function updateLink(id: string, data: Partial<HoLinkItem>): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (!link) return

    Object.assign(link, data, { updatedAt: new Date().toISOString() })
    saveToStorage()
  }

  function deleteLink(id: string): void {
    if (!currentUser.value) return

    const index = currentUser.value.links.findIndex((l) => l.id === id)
    if (index === -1) return

    // If there's already a pending delete, confirm it first
    if (lastDeletedLink.value) {
      confirmDelete()
    }

    const removed = currentUser.value.links.splice(index, 1)[0]
    if (!removed) return

    lastDeletedLink.value = removed
    reorderLinks()
    saveToStorage()
  }

  function undoDelete(): void {
    if (!currentUser.value || !lastDeletedLink.value) return

    const restored = lastDeletedLink.value
    restored.order = getNextOrder()
    currentUser.value.links.push(restored)
    lastDeletedLink.value = null
    reorderLinks()
    saveToStorage()
  }

  function confirmDelete(): void {
    lastDeletedLink.value = null
    saveToStorage()
  }

  function toggleLinkActive(id: string): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (!link) return

    link.isActive = !link.isActive
    link.updatedAt = new Date().toISOString()
    saveToStorage()
  }

  function moveLink(id: string, direction: 'up' | 'down'): void {
    if (!currentUser.value) return

    const sorted = [...currentUser.value.links].sort((a, b) => a.order - b.order)
    const currentIndex = sorted.findIndex((l) => l.id === id)
    if (currentIndex === -1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    // Swap order values (bounds already validated above)
    const currentLink = sorted[currentIndex]!
    const swapLink = sorted[swapIndex]!

    const tempOrder = currentLink.order
    currentLink.order = swapLink.order
    swapLink.order = tempOrder

    saveToStorage()
  }

  function logLinkClick(id: string): void {
    if (!currentUser.value) return

    const link = currentUser.value.links.find((l) => l.id === id)
    if (link) {
      logEvent('link_clicked', { id: link.id, title: link.title, url: link.normalizedUrl })
    }
  }

  function logProfileView(): void {
    if (!currentUser.value) return
    logEvent('public_profile_viewed', { username: currentUser.value.username })
  }

  // ── Initialize on creation ────────────────────────────────────────────────
  initialize()

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    // State
    currentUser,
    isLoading,
    lastDeletedLink,
    searchQuery,

    // Getters
    sortedLinks,
    filteredLinks,
    hasUndoableDelete,

    // Actions
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    undoDelete,
    confirmDelete,
    toggleLinkActive,
    moveLink,
    logLinkClick,
    logProfileView,
  }
})
