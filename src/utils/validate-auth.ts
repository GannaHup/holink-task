export const USERNAME_MAX = 30
export const USERNAME_MIN = 3
export const PASSWORD_MIN = 6

export function validateUsername(username: string, required = false): string {
  const normalized = username.trim().toLowerCase()
  if (!required && normalized.length === 0) return ''
  if (required && normalized.length === 0) return 'Username is required'
  if (normalized.length > 0 && normalized.length < USERNAME_MIN)
    return 'Username must be at least 3 characters'
  if (normalized.length > USERNAME_MAX) return 'Username must be at most 30 characters'
  if (!/^[a-z0-9_-]+$/.test(normalized))
    return 'Username can only contain lowercase letters, numbers, dashes, and underscores'
  if (!/[a-z]/.test(normalized)) return 'Username must contain at least one letter'
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
