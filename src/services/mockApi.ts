/**
 * HoLink Mock API Service Layer
 * ------------------------------
 * Simulates a backend REST API backed by `localStorage`. The shape of each
 * method mirrors what a real HTTP client (e.g. `fetch`/axios) would expose, so
 * swapping this module for a live API later should require no changes to the
 * store or UI that consumes it.
 *
 * Responsibilities:
 *  - Persist a single demo user (`HoLinkUser`) to `localStorage`.
 *  - Track lightweight analytics events (`holink_analytics`).
 *  - Simulate realistic network latency so loading states can be exercised.
 */

import type { HoLinkItem, HoLinkUser, Platform } from '@/models'
import { generateId } from '@/utils/link'

// ─── Constants ──────────────────────────────────────────────────────────────

/** localStorage key for the persisted demo user. */
const DB_KEY = 'holink_mock_db'

/** localStorage key for the analytics event log. */
const ANALYTICS_KEY = 'holink_analytics'

// ─── Analytics Types ─────────────────────────────────────────────────────────

/** Names of analytics events emitted by the service. */
type AnalyticsEventName = 'profile_saved' | 'link_added' | 'link_clicked' | 'public_profile_viewed'

/** A single analytics event record. */
interface AnalyticsEvent {
  eventName: AnalyticsEventName
  payload: Record<string, unknown>
  timestamp: string
}

// ─── Default Data ─────────────────────────────────────────────────────────────

/**
 * Build a fresh demo user. A factory is used (rather than a shared object) so
 * each call yields independent IDs/timestamps and cannot be mutated by accident.
 */
function createDefaultUser(): HoLinkUser {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    username: 'creator-demo',
    displayName: 'Demo Creator',
    bio: 'Content creator 🎬 | Sharing my journey, one link at a time ✨',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator-demo',
    updatedAt: now,
    links: [
      {
        id: generateId(),
        title: 'My Instagram',
        url: 'https://www.instagram.com/creator-demo',
        normalizedUrl: 'https://www.instagram.com/creator-demo',
        platform: 'instagram',
        isActive: true,
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'Subscribe on YouTube',
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

// ─── Internal Helpers (not exported) ─────────────────────────────────────────

/**
 * Resolve a promise after the given number of milliseconds, used to emulate
 * network latency so consumers can demonstrate loading states.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Safely read and parse the persisted user from `localStorage`.
 * Falls back to a fresh {@link createDefaultUser} instance if storage is empty
 * or the stored JSON is corrupt/unparseable, ensuring the app never crashes.
 */
function getDB(): HoLinkUser {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      return JSON.parse(raw) as HoLinkUser
    }
  } catch (error) {
    console.error('[HoLink MockAPI] Failed to parse DB from localStorage:', error)
  }
  // Seed storage with default data so subsequent reads are consistent.
  const defaults = createDefaultUser()
  saveDB(defaults)
  return defaults
}

/**
 * Serialize and persist a user record to `localStorage`.
 * Errors are logged but not re-thrown — persistence failures must not crash
 * the UI (mirroring how a real client would surface transient network errors).
 */
function saveDB(data: HoLinkUser): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('[HoLink MockAPI] Failed to save DB to localStorage:', error)
  }
}

/**
 * Append an analytics event to the log in `localStorage` and mirror it to the
 * console for easy debugging. The payload is intentionally a plain record so
 * callers can attach arbitrary, event-specific context.
 */
function logAnalytics(eventName: AnalyticsEventName, payload: Record<string, unknown>): void {
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
    console.error('[HoLink MockAPI] Failed to persist analytics event:', error)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a user by username (case-insensitive).
 *
 * @param username - The username to look up.
 * @returns The matching user, or `null` when no user is found.
 */
export async function getUserByUsername(username: string): Promise<HoLinkUser | null> {
  await delay(300)
  const db = getDB()
  return db.username.toLowerCase() === username.trim().toLowerCase() ? db : null
}

/**
 * Update the authenticated user's profile fields.
 *
 * - `id` and `links` are stripped from the payload so callers cannot mutate
 *   identity or link collection through this method.
 * - Sets `updatedAt` on the user and fires a `profile_saved` analytics event
 *   listing the names of the changed fields.
 *
 * @param userData - Partial profile fields to merge.
 * @returns The updated user record.
 */
export async function updateProfile(userData: Partial<HoLinkUser>): Promise<HoLinkUser> {
  await delay(500)

  const db = getDB()
  // Protect identity & link ownership from accidental mutation via this method.
  const { id: _id, links: _links, ...safeData } = userData

  const updatedUser: HoLinkUser = {
    ...db,
    ...safeData,
    id: db.id,
    links: db.links,
    updatedAt: new Date().toISOString(),
  }

  saveDB(updatedUser)
  logAnalytics('profile_saved', {
    username: updatedUser.username,
    changed_fields: Object.keys(safeData),
    timestamp: updatedUser.updatedAt,
  })

  return updatedUser
}

/**
 * Payload accepted by {@link addLink}. Platform-typed URL data is produced by
 * the existing `normalizeUrl` / `detectPlatform` utilities in the UI layer.
 */
interface AddLinkPayload {
  title: string
  url: string
  normalizedUrl: string
  platform: Platform
}

/**
 * Append a new link to the user's profile.
 *
 * The new link receives a unique id (via `crypto.randomUUID` with a fallback),
 * starts active, and is ordered at the end of the list. A `link_added`
 * analytics event is emitted.
 *
 * @param linkData - Title, URL, normalized URL, and platform for the new link.
 * @returns The newly created link item.
 */
export async function addLink(linkData: AddLinkPayload): Promise<HoLinkItem> {
  await delay(400)

  const db = getDB()
  const now = new Date().toISOString()

  const newLink: HoLinkItem = {
    id: generateId(),
    title: linkData.title,
    url: linkData.url,
    normalizedUrl: linkData.normalizedUrl,
    platform: linkData.platform,
    isActive: true,
    order: db.links.length,
    createdAt: now,
    updatedAt: now,
  }

  const updatedUser: HoLinkUser = {
    ...db,
    links: [...db.links, newLink],
    updatedAt: now,
  }

  saveDB(updatedUser)
  logAnalytics('link_added', {
    id: newLink.id,
    title: newLink.title,
    url: newLink.normalizedUrl,
    platform: newLink.platform,
  })

  return newLink
}

/**
 * Apply partial updates to a single link, identified by id.
 *
 * @param linkId   - Id of the link to mutate.
 * @param updates  - Partial link fields to merge (e.g. title, url, isActive).
 * @returns The updated link, or `null` if no link matched `linkId`.
 */
export async function updateLink(
  linkId: string,
  updates: Partial<HoLinkItem>,
): Promise<HoLinkItem | null> {
  await delay(300)

  const db = getDB()
  const index = db.links.findIndex((link) => link.id === linkId)
  if (index === -1) return null

  const existing = db.links[index]!
  const updatedLink: HoLinkItem = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  const nextLinks = [...db.links]
  nextLinks[index] = updatedLink

  saveDB({ ...db, links: nextLinks })
  return updatedLink
}

/**
 * Delete a link by id and persist the change.
 *
 * @param linkId - Id of the link to remove.
 */
export async function deleteLink(linkId: string): Promise<void> {
  await delay(300)

  const db = getDB()
  const nextLinks = db.links.filter((link) => link.id !== linkId)

  if (nextLinks.length === db.links.length) return // nothing to delete

  saveDB({
    ...db,
    links: nextLinks,
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Replace the user's links with a reordered array.
 *
 * The caller is responsible for ordering the array; this method persists it
 * verbatim and bumps the user-level `updatedAt`. Link `order` fields are not
 * rewritten here — pass normalized data if you need contiguous `order` values.
 *
 * @param updatedLinks - The full link collection in its new order.
 * @returns The updated user record.
 */
export async function reorderLinks(updatedLinks: HoLinkItem[]): Promise<HoLinkUser> {
  await delay(300)

  const db = getDB()
  const updatedUser: HoLinkUser = {
    ...db,
    links: updatedLinks,
    updatedAt: new Date().toISOString(),
  }

  saveDB(updatedUser)
  return updatedUser
}

/**
 * Record a click on a public profile link.
 *
 * Intended for the public-facing preview page: it only emits analytics and
 * never mutates user data. Returns immediately (no artificial latency) so the
 * outbound navigation is not delayed.
 *
 * @param username - Owner of the profile being viewed.
 * @param linkId   - Id of the clicked link.
 * @param platform - Platform of the clicked link.
 */
export async function recordLinkClick(
  username: string,
  linkId: string,
  platform: Platform,
): Promise<void> {
  logAnalytics('link_clicked', { username, linkId, platform })
}
