import type { Platform } from '@/models'

// ─── Dangerous protocols to reject ──────────────────────────────────────────
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'file:'] as const

// ─── Platform hostname patterns ─────────────────────────────────────────────
const PLATFORM_PATTERNS: ReadonlyArray<{ pattern: RegExp; platform: Platform }> = [
  { pattern: /(?:^|[./])instagram\.com/i, platform: 'instagram' },
  { pattern: /(?:^|[./])youtube\.com/i, platform: 'youtube' },
  { pattern: /(?:^|[./])youtu\.be/i, platform: 'youtube' },
  { pattern: /(?:^|[./])tiktok\.com/i, platform: 'tiktok' },
  { pattern: /(?:^|[./])wa\.me/i, platform: 'whatsapp' },
  { pattern: /(?:^|[./])whatsapp\.com/i, platform: 'whatsapp' },
  { pattern: /(?:^|[./])tokopedia\.com/i, platform: 'marketplace' },
  { pattern: /(?:^|[./])shopee\.co(?:\.id|\.th|\.vn|\.ph|\.my|\.sg)/i, platform: 'marketplace' },
  { pattern: /(?:^|[./])bukalapak\.com/i, platform: 'marketplace' },
  { pattern: /(?:^|[./])lazada\.co(?:\.id|\.th|\.vn|\.ph)/i, platform: 'marketplace' },
]

// ─── normalizeUrl ───────────────────────────────────────────────────────────

export interface NormalizeUrlResult {
  isValid: boolean
  normalizedUrl: string
  error?: string
}

/**
 * Normalize a URL by ensuring it has a valid protocol.
 * Rejects dangerous protocols (javascript:, data:, file:).
 */
export function normalizeUrl(url: string): NormalizeUrlResult {
  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return { isValid: false, normalizedUrl: '', error: 'URL cannot be empty' }
  }

  // Check for dangerous protocols (case-insensitive)
  const lowerUrl = trimmed.toLowerCase()
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: `Protocol "${protocol}" is not allowed`,
      }
    }
  }

  // Prepend https:// if no valid protocol is present
  let normalized = trimmed
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }

  // Validate the resulting URL using the URL constructor
  try {
    const parsed = new URL(normalized)
    return { isValid: true, normalizedUrl: parsed.href }
  } catch {
    return { isValid: false, normalizedUrl: normalized, error: 'Invalid URL format' }
  }
}

// ─── detectPlatform ─────────────────────────────────────────────────────────

/**
 * Detect the platform from a URL string.
 * Returns 'unknown' for empty/invalid URLs and 'website' as the default fallback.
 */
export function detectPlatform(url: string): Platform {
  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return 'unknown'
  }

  // Try to extract a hostname; if that fails, match against the raw string
  let hostname = trimmed
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    hostname = parsed.hostname
  } catch {
    // Use the raw string as fallback for pattern matching
    hostname = trimmed
  }

  for (const { pattern, platform } of PLATFORM_PATTERNS) {
    if (pattern.test(hostname)) {
      return platform
    }
  }

  return 'website'
}

// ─── generateId ─────────────────────────────────────────────────────────────

/**
 * Generate a unique ID using crypto.randomUUID() with a fallback.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
