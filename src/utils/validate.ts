export const USERNAME_MAX = 30
export const USERNAME_MIN = 3
export const PASSWORD_MIN = 6
export const DISPLAY_NAME_MAX = 50
export const BIO_MAX = 160

export function validateUsername(username: string, required = false): string {
  if (!required && username.length === 0) return ''
  if (required && username.length === 0) return 'Username is required'
  if (username.length > 0 && username.length < USERNAME_MIN)
    return 'Username must be at least 3 characters'
  if (username.length > USERNAME_MAX) return 'Username must be at most 30 characters'
  if (!/^[a-z0-9_-]+$/.test(username))
    return 'Username can only contain lowercase letters, numbers, dashes, and underscores'
  if (!/[a-z]/.test(username)) return 'Username must contain at least one letter'
  return ''
}

export function validatePassword(password: string): string {
  if (password.length > 0 && password.length < PASSWORD_MIN)
    return 'Password must be at least 6 characters'
  return ''
}

export function validateConfirmPassword(password: string, confirm: string): string {
  if (confirm.length > 0 && confirm !== password) return 'Passwords do not match'
  return ''
}

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
  if (!required && url.length === 0) return ''
  if (required && url.length === 0) return 'Avatar URL is required'

  const trimmed = url.trim().toLowerCase()

  // Pre-check for dangerous/suspicious protocols
  const dangerous = ['javascript:', 'data:', 'file:', 'vbscript:', 'php:']
  if (dangerous.some((proto) => trimmed.startsWith(proto))) {
    return 'Suspicious protocol detected'
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'Invalid protocol. Use http:// or https://'
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Only http or https protocols are allowed'
    }
  } catch {
    return 'Invalid URL format'
  }

  return ''
}
