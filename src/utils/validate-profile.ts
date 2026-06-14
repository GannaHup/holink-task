import { normalizeUrl } from '@/utils/validate-url'

export const DISPLAY_NAME_MAX = 50
export const BIO_MAX = 160

export function validateDisplayName(displayName: string, required = false): string {
  if (required && displayName.length === 0) return 'Display name is required'
  if (displayName.length > DISPLAY_NAME_MAX) return `Max ${DISPLAY_NAME_MAX} characters`
  return ''
}

export function validateBio(bio: string): string {
  if (bio.length > BIO_MAX) return `Max ${BIO_MAX} characters`
  return ''
}

export function validateAvatarUrl(url: string, required = false): string {
  if (url.trim().length === 0) {
    return required ? 'Avatar URL is required' : ''
  }

  const result = normalizeUrl(url)
  return result.isValid ? '' : (result.error ?? 'Invalid URL')
}
