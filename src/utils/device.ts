export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Detect the visitor's device category from the user agent.
 * Falls back to 'desktop' when detection fails (e.g. SSR or unknown UA).
 */
export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined' || !navigator.userAgent) {
    return 'desktop'
  }

  const ua = navigator.userAgent

  if (/tablet|ipad/i.test(ua)) {
    return 'tablet'
  }

  if (/mobi|iphone|android.*mobile|windows phone/i.test(ua)) {
    return 'mobile'
  }

  // Android tablets without "tablet" in the UA
  if (/android/i.test(ua) && !/mobile/i.test(ua)) {
    return 'tablet'
  }

  return 'desktop'
}
