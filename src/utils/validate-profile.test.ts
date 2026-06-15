import { describe, it, expect, vi, type Mock } from 'vitest'
import {
  validateDisplayName,
  validateBio,
  validateAvatarUrl,
  DISPLAY_NAME_MAX,
  BIO_MAX,
} from './validate-profile'
import { normalizeUrl } from './validate-url'

// Mock normalizeUrl
vi.mock('./validate-url', () => ({
  normalizeUrl: vi.fn(),
}))

const mockNormalizeUrl = normalizeUrl as Mock

describe('validateDisplayName', () => {
  it('should return empty string for empty optional display name', () => {
    expect(validateDisplayName('')).toBe('')
  })

  it('should return error for required empty display name', () => {
    expect(validateDisplayName('', true)).toBe('Display name is required')
  })

  it('should return error for display name exceeding max length', () => {
    const longName = 'a'.repeat(DISPLAY_NAME_MAX + 1)
    expect(validateDisplayName(longName)).toBe(`Max ${DISPLAY_NAME_MAX} characters`)
  })

  it('should return empty string for valid display name', () => {
    expect(validateDisplayName('John Doe')).toBe('')
  })
})

describe('validateBio', () => {
  it('should return empty string for empty bio', () => {
    expect(validateBio('')).toBe('')
  })

  it('should return error for bio exceeding max length', () => {
    const longBio = 'a'.repeat(BIO_MAX + 1)
    expect(validateBio(longBio)).toBe(`Max ${BIO_MAX} characters`)
  })

  it('should return empty string for valid bio', () => {
    expect(validateBio('Hello World!')).toBe('')
  })
})

describe('validateAvatarUrl', () => {
  it('should return empty string for empty optional avatar URL', () => {
    expect(validateAvatarUrl('')).toBe('')
  })

  it('should return error for required empty avatar URL', () => {
    expect(validateAvatarUrl('', true)).toBe('Avatar URL is required')
  })

  it('should return error for invalid avatar URL', () => {
    mockNormalizeUrl.mockReturnValue({ isValid: false, error: 'Invalid URL' })
    expect(validateAvatarUrl('invalid url')).toBe('Invalid URL')
  })

  it('should return default error for invalid avatar URL without error message', () => {
    // Hits the ?? 'Invalid URL' branch in validate-profile.ts
    mockNormalizeUrl.mockReturnValue({ isValid: false, normalizedUrl: '' })
    expect(validateAvatarUrl('bad-url')).toBe('Invalid URL')
  })

  it('should return empty string for valid avatar URL', () => {
    mockNormalizeUrl.mockReturnValue({
      isValid: true,
      normalizedUrl: 'https://example.com/avatar.png',
    })
    expect(validateAvatarUrl('https://example.com/avatar.png')).toBe('')
  })
})
