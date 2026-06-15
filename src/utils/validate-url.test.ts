import { describe, it, expect } from 'vitest'
import { normalizeUrl } from './validate-url'

describe('normalizeUrl', () => {
  it('should return error for empty URL', () => {
    const result = normalizeUrl('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('URL cannot be empty')
  })

  it('should prepend https:// if protocol is missing', () => {
    const result = normalizeUrl('google.com')
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://google.com/')
  })

  it('should allow http:// and https://', () => {
    expect(normalizeUrl('http://example.com').isValid).toBe(true)
    expect(normalizeUrl('https://example.com').isValid).toBe(true)
  })

  it('should block suspicious patterns like javascript:', () => {
    const result = normalizeUrl('javascript:alert(1)')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('suspicious pattern')
  })

  it('should block suspicious patterns anywhere in URL', () => {
    const result = normalizeUrl('https://example.com/?q=javascript:alert(1)')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('suspicious pattern')
  })

  it('should block multiple protocols', () => {
    const result = normalizeUrl('https://http://example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('URL contains multiple protocols')
  })

  it('should block non-HTTP protocols that are suspicious patterns', () => {
    const result = normalizeUrl('ftp://example.com')
    expect(result.isValid).toBe(false)
    // Should be caught by suspicious patterns check first
    expect(result.error).toContain('suspicious pattern')
  })

  it('should block non-HTTP protocols via protocol check', () => {
    // ws:// is not in SUSPICIOUS_PATTERNS but is not http/https
    const result = normalizeUrl('ws://example.com')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('is not allowed')
  })

  it('should return normalized URL for valid inputs', () => {
    const result = normalizeUrl('  WWW.GOOGLE.COM/PATH?query=1  ')
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://www.google.com/PATH?query=1')
  })
})
