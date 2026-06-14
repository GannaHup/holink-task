// ─── Shared Constants ────────────────────────────────────────────────────────

const SUSPICIOUS_PATTERNS = [
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'php:',
  'mailto:',
  'tel:',
  'sms:',
  'ftp:',
] as const

const SUSPICIOUS_HOSTNAMES: readonly string[] = [
  'ws',
  'wss',
  'ftp',
  'ftps',
  'ssh',
  'telnet',
  'mailto',
] as const

export interface NormalizeUrlResult {
  isValid: boolean
  normalizedUrl: string
  error?: string
}

export function normalizeUrl(url: string): NormalizeUrlResult {
  const trimmed = url.trim()

  // Empty check
  if (trimmed.length === 0) {
    return { isValid: false, normalizedUrl: '', error: 'URL cannot be empty' }
  }

  // Check for suspicious patterns ANYWHERE in the URL
  const lowerUrl = trimmed.toLowerCase()
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (lowerUrl.includes(pattern)) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: `URL contains suspicious pattern "${pattern}"`,
      }
    }
  }

  // Check if there is "://" more than once (hidden protocol)
  const protocolCount = (trimmed.match(/:\/\//g) || []).length
  if (protocolCount > 1) {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      error: 'URL contains multiple protocols',
    }
  }

  // Check for other non-HTTP protocols at the start
  const protocolMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/)
  if (protocolMatch) {
    const detectedProtocol = protocolMatch[1]?.toLowerCase()
    if (detectedProtocol !== 'http' && detectedProtocol !== 'https') {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: `Protocol "${detectedProtocol}:" is not allowed. Use http or https only.`,
      }
    }
  }

  // Prepend https:// if no protocol
  let normalized = trimmed
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }

  // Validate with URL constructor
  try {
    const parsed = new URL(normalized)

    // Double-check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: normalized,
        error: `Protocol "${parsed.protocol}" is not allowed. Use http or https only.`,
      }
    }

    // Check hostname exists
    if (!parsed.hostname) {
      return {
        isValid: false,
        normalizedUrl: normalized,
        error: 'URL must have a valid domain',
      }
    }

    // Check suspicious hostnames
    if (SUSPICIOUS_HOSTNAMES.includes(parsed.hostname.toLowerCase())) {
      return {
        isValid: false,
        normalizedUrl: normalized,
        error: `Invalid hostname "${parsed.hostname}"`,
      }
    }

    return { isValid: true, normalizedUrl: parsed.href }
  } catch {
    return { isValid: false, normalizedUrl: normalized, error: 'Invalid URL format' }
  }
}
