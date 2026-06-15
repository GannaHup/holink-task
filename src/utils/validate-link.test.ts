import { describe, it, expect } from 'vitest'
import { validateLinkTitle, validateLinkUrl, LINK_TITLE_MAX, LINK_URL_MAX } from './validate-link'

describe('validateLinkTitle', () => {
  it('should return empty string for empty optional title', () => {
    expect(validateLinkTitle('')).toBe('')
    expect(validateLinkTitle('   ')).toBe('')
  })

  it('should return error for required empty title', () => {
    expect(validateLinkTitle('', true)).toBe('Title is required')
    expect(validateLinkTitle('   ', true)).toBe('Title is required')
  })

  it('should return error for title exceeding max length', () => {
    const longTitle = 'a'.repeat(LINK_TITLE_MAX + 1)
    expect(validateLinkTitle(longTitle)).toBe(`Title must be at most ${LINK_TITLE_MAX} characters`)
  })

  it('should return empty string for valid title', () => {
    expect(validateLinkTitle('My Link')).toBe('')
    expect(validateLinkTitle('My Link', true)).toBe('')
  })
})

describe('validateLinkUrl', () => {
  it('should return empty string for empty optional URL', () => {
    expect(validateLinkUrl('')).toBe('')
    expect(validateLinkUrl('   ')).toBe('')
  })

  it('should return error for required empty URL', () => {
    expect(validateLinkUrl('', true)).toBe('URL is required')
    expect(validateLinkUrl('   ', true)).toBe('URL is required')
  })

  it('should return error for URL exceeding max length', () => {
    const longUrl = 'a'.repeat(LINK_URL_MAX + 1)
    expect(validateLinkUrl(longUrl)).toBe(`URL must be at most ${LINK_URL_MAX} characters`)
  })

  it('should return empty string for valid URL', () => {
    expect(validateLinkUrl('https://example.com')).toBe('')
    expect(validateLinkUrl('https://example.com', true)).toBe('')
  })
})
