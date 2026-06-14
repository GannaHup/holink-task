import type { HoLinkUser } from '@/models'

export const SESSION_KEY = 'holink_data'
export const USERS_KEY = 'holink_users'
export const AUTH_KEY = 'holink_auth'
export const ANALYTICS_KEY = 'holink_analytics'

export type UserRegistry = Record<string, HoLinkUser>

export type AnalyticsEventName =
  | 'profile_saved'
  | 'link_added'
  | 'link_clicked'
  | 'public_profile_viewed'

export interface AnalyticsEvent {
  eventName: AnalyticsEventName
  payload: Record<string, unknown>
  timestamp: string
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (error) {
    console.error(`[HoLink] Failed to read "${key}" from localStorage:`, error)
    return fallback
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`[HoLink] Failed to write "${key}" to localStorage:`, error)
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`[HoLink] Failed to remove "${key}" from localStorage:`, error)
  }
}

export function loadSessionUser(): HoLinkUser | null {
  return readJSON<HoLinkUser | null>(SESSION_KEY, null)
}

export function saveSessionUser(user: HoLinkUser): void {
  writeJSON(SESSION_KEY, user)
}

export function clearSession(): void {
  removeKey(SESSION_KEY)
}

export function loadRegistry(): UserRegistry {
  return readJSON<UserRegistry>(USERS_KEY, {})
}

export function saveRegistry(registry: UserRegistry): void {
  writeJSON(USERS_KEY, registry)
}

export function upsertUser(user: HoLinkUser): void {
  const registry = loadRegistry()
  registry[user.username.toLowerCase()] = user
  saveRegistry(registry)
}

export function removeUser(username: string): void {
  const registry = loadRegistry()
  delete registry[username.trim().toLowerCase()]
  saveRegistry(registry)
}

export function findUserByUsername(username: string): HoLinkUser | null {
  return loadRegistry()[username.trim().toLowerCase()] ?? null
}

export function loadAuth(): string | null {
  return readJSON<string | null>(AUTH_KEY, null)
}

export function saveAuth(username: string | null): void {
  if (username) {
    writeJSON(AUTH_KEY, username)
  } else {
    removeKey(AUTH_KEY)
  }
}

export function logAnalytics(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown>,
): void {
  const event: AnalyticsEvent = {
    eventName,
    payload,
    timestamp: new Date().toISOString(),
  }

  console.log(`[HoLink Analytics] ${event.timestamp} — ${eventName}`, payload)

  const events = readJSON<AnalyticsEvent[]>(ANALYTICS_KEY, [])
  events.push(event)
  writeJSON(ANALYTICS_KEY, events)
}
