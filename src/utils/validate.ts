export function validateUsername(username: string, required = false): string {
  if (!required && username.length === 0) return ''
  if (required && username.length === 0) return 'Username is required'
  if (username.length > 0 && username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 30) return 'Username must be at most 30 characters'
  if (!/^[a-z0-9_-]+$/.test(username))
    return 'Username can only contain lowercase letters, numbers, dashes, and underscores'
  if (!/[a-z]/.test(username)) return 'Username must contain at least one letter'
  return ''
}

export function validatePassword(password: string): string {
  if (password.length > 0 && password.length < 6) return 'Password must be at least 6 characters'
  return ''
}

export function validateConfirmPassword(password: string, confirm: string): string {
  if (confirm.length > 0 && confirm !== password) return 'Passwords do not match'
  return ''
}
