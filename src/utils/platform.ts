import type { Platform } from '@/models'

// ─── Config ──────────────────────────────────────────────────────────────────
const PLATFORM_PATTERNS: ReadonlyArray<{ pattern: RegExp; platform: Platform }> = [
  { pattern: /(?:^|[./])instagram\.com/i, platform: 'instagram' },
  { pattern: /(?:^|[./])(?:youtube\.com|youtu\.be)/i, platform: 'youtube' },
  { pattern: /(?:^|[./])tiktok\.com/i, platform: 'tiktok' },
  { pattern: /(?:^|[./])(?:wa\.me|whatsapp\.com)/i, platform: 'whatsapp' },
  {
    pattern:
      /(?:^|[./])(?:tokopedia\.com|shopee\.co(?:\.id|\.th|\.vn|\.ph|\.my|\.sg)|bukalapak\.com|lazada\.co(?:\.id|\.th|\.vn|\.ph))/i,
    platform: 'marketplace',
  },
]

// ─── detectPlatform ─────────────────────────────────────────────────────────
export function detectPlatform(url: string): Platform {
  const trimmed = url.trim()
  if (!trimmed) return 'unknown'

  const hostname = getHostname(trimmed)
  const match = PLATFORM_PATTERNS.find((p) => p.pattern.test(hostname))

  return match ? match.platform : 'website'
}

/**
 * Extract the registrable domain (hostname) from a URL.
 * Used for analytics (e.g. `url_domain`).
 */
export function getUrlDomain(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  return getHostname(trimmed)
}

function getHostname(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
  } catch {
    return url
  }
}
