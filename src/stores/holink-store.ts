import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HoLinkUser, HoLinkItem } from '@/models'
import { normalizeUrl, detectPlatform, generateId } from '@/utils/link'

// ─── Constants ──────────────────────────────────────────────────────────────

/** Session copy of the currently authenticated user (fast restore on reload). */
const STORAGE_KEY = 'holink_data'
/** Multi-user registry keyed by lowercase username. */
const USERS_KEY = 'holink_users'
/** Stores the username of the logged-in user (empty/absent = logged out). */
const AUTH_KEY = 'holink_auth'
/** Analytics event log. */
const ANALYTICS_KEY = 'holink_analytics'

// ─── Analytics Types ────────────────────────────────────────────────────────

type AnalyticsEventName = 'profile_saved' | 'link_added' | 'link_clicked' | 'public_profile_viewed'

interface AnalyticsEvent {
  eventName: AnalyticsEventName
  payload: Record<string, unknown>
  timestamp: string
}

// ─── Multi-user Registry Types ───────────────────────────────────────────────

/** Map of every registered user, keyed by lowercase username. */
type UserRegistry = Record<string, HoLinkUser>

// ─── Demo Seed Data ──────────────────────────────────────────────────────────

/**
 * Build a demo user used to seed the registry on first run, so the public
 * profile page has something to render and a sample account can be logged into.
 * This user is NOT auto-authenticated.
 */
function createDemoUser(): HoLinkUser {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    username: 'creator-demo',
    displayName: 'Demo Creator',
    bio: 'Welcome to my page! 🚀',
    avatarUrl: undefined,
    links: [
      {
        id: generateId(),
        title: 'Instagram',
        url: 'https://www.instagram.com/creator-demo/',
        normalizedUrl: 'https://www.instagram.com/creator-demo/',
        platform: 'instagram',
        isActive: true,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'YouTube Channel',
        url: 'https://www.youtube.com/@creator-demo',
        normalizedUrl: 'https://www.youtube.com/@creator-demo',
        platform: 'youtube',
        isActive: true,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
  }
}

/**
 * Build a fresh, empty user for a brand-new account created via the login flow.
 */
function createNewUser(username: string): HoLinkUser {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    username,
    displayName: username,
    bio: '',
    avatarUrl: undefined,
    links: [],
    updatedAt: now,
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useHolinkStore = defineStore('holink', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const currentUser = ref<HoLinkUser | null>(null)
  const isAuthenticated = ref<boolean>(false)
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

  // ── Session persistence (single active user) ──

  function saveToStorage(): void {
    if (!currentUser.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value))
      // Keep the registry in sync so public profiles reflect mutations.
      upsertUser(currentUser.value)
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

  // ── Multi-user registry ──

  function loadUsers(): UserRegistry {
    try {
      const raw = localStorage.getItem(USERS_KEY)
      if (raw) {
        return JSON.parse(raw) as UserRegistry
      }
    } catch (error) {
      console.error('[HoLink] Failed to parse user registry:', error)
    }
    return {}
  }

  function saveUsers(registry: UserRegistry): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(registry))
    } catch (error) {
      console.error('[HoLink] Failed to save user registry:', error)
    }
  }

  /** Insert or update a user in the registry, keyed by lowercase username. */
  function upsertUser(user: HoLinkUser): void {
    const registry = loadUsers()
    registry[user.username.toLowerCase()] = user
    saveUsers(registry)
  }

  /** Find a user by username without requiring authentication. */
  function findUserByUsername(username: string): HoLinkUser | null {
    const registry = loadUsers()
    return registry[username.toLowerCase()] ?? null
  }

  // ── Auth persistence ──

  function saveAuth(username: string | null): void {
    try {
      if (username) {
        localStorage.setItem(AUTH_KEY, username)
      } else {
        localStorage.removeItem(AUTH_KEY)
      }
    } catch (error) {
      console.error('[HoLink] Failed to persist auth state:', error)
    }
  }

  function loadAuth(): string | null {
    try {
      return localStorage.getItem(AUTH_KEY)
    } catch (error) {
      console.error('[HoLink] Failed to read auth state:', error)
      return null
    }
  }

  // ── Analytics ──

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

  // ── Actions: Auth ─────────────────────────────────────────────────────────

  /**
   * Restore the app state on load:
   *  1. Seed the registry with a demo user if it is empty.
   *  2. If an authenticated username was persisted, restore that user.
   *  3. Otherwise leave `currentUser` null until the user logs in.
   */
  function initialize(): void {
    isLoading.value = true
    try {
      // Seed demo account on first run for public-profile / sample login.
      const registry = loadUsers()
      if (Object.keys(registry).length === 0) {
        const demo = createDemoUser()
        registry[demo.username.toLowerCase()] = demo
        saveUsers(registry)
      }

      const authedUsername = loadAuth()
      if (authedUsername) {
        // Prefer the registry copy (source of truth), fall back to session.
        const user = findUserByUsername(authedUsername) ?? loadFromStorage()
        if (user) {
          currentUser.value = user
          isAuthenticated.value = true
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Authenticate (or register) a user by username.
   * - If the username exists in the registry, load it.
   * - If it does not exist, create a fresh user and persist it.
   * Returns `true` on success.
   */
  function login(username: string): boolean {
    const normalized = username.trim()
    if (normalized.length === 0) return false

    const existing = findUserByUsername(normalized)
    const user = existing ?? createNewUser(normalized)

    if (!existing) {
      upsertUser(user)
    }

    currentUser.value = user
    isAuthenticated.value = true
    saveAuth(user.username)
    saveToStorage()
    return true
  }

  /** Clear the authenticated session. User data is preserved in the registry. */
  function logout(): void {
    currentUser.value = null
    isAuthenticated.value = false
    lastDeletedLink.value = null
    searchQuery.value = ''
    saveAuth(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('[HoLink] Failed to clear session:', error)
    }
  }

  // ── Actions: Profile & Links ───────────────────────────────────────────────

  async function updateProfile(
    data: Partial<HoLinkUser>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!currentUser.value) return { success: false, error: 'No user initialized' }

    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Prevent direct mutation of links through updateProfile
      const { links: _links, ...safeData } = data

      Object.assign(currentUser.value, safeData)
      saveToStorage()
      logEvent('profile_saved', { ...safeData })

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

  function updateLinksOrder(newLinks: HoLinkItem[]): void {
    if (!currentUser.value) return

    // Update the order property for each link based on its new position in the array
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
    isAuthenticated,
    isLoading,
    lastDeletedLink,
    searchQuery,

    // Getters
    sortedLinks,
    filteredLinks,
    hasUndoableDelete,

    // Actions: Auth
    login,
    logout,
    findUserByUsername,

    // Actions: Profile & Links
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
