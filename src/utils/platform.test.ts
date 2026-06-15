import { describe, it, expect } from 'vitest'
import { detectPlatform, getUrlDomain } from './platform'

describe('detectPlatform', () => {
  it('should return "unknown" for empty URL', () => {
    expect(detectPlatform('')).toBe('unknown')
  })

  it('should detect instagram', () => {
    expect(detectPlatform('https://instagram.com/user')).toBe('instagram')
    expect(detectPlatform('https://www.instagram.com/user')).toBe('instagram')
    expect(detectPlatform('instagram.com/user')).toBe('instagram')
  })

  it('should detect youtube', () => {
    expect(detectPlatform('https://youtube.com/watch?v=abc')).toBe('youtube')
    expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe('youtube')
    expect(detectPlatform('https://youtu.be/abc')).toBe('youtube')
    expect(detectPlatform('youtu.be/abc')).toBe('youtube')
  })

  it('should detect tiktok', () => {
    expect(detectPlatform('https://tiktok.com/@user')).toBe('tiktok')
    expect(detectPlatform('https://www.tiktok.com/@user')).toBe('tiktok')
  })

  it('should detect whatsapp', () => {
    expect(detectPlatform('https://wa.me/1234567890')).toBe('whatsapp')
    expect(detectPlatform('https://whatsapp.com/')).toBe('whatsapp')
  })

  it('should detect marketplace', () => {
    expect(detectPlatform('https://tokopedia.com/product/123')).toBe('marketplace')
    expect(detectPlatform('https://shopee.co.id/product/123')).toBe('marketplace')
    expect(detectPlatform('https://shopee.co.th/product/123')).toBe('marketplace')
    expect(detectPlatform('https://bukalapak.com/product/123')).toBe('marketplace')
    expect(detectPlatform('https://lazada.co.id/product/123')).toBe('marketplace')
  })

  it('should return "website" for other valid URLs', () => {
    expect(detectPlatform('https://google.com')).toBe('website')
    expect(detectPlatform('https://github.com/user/repo')).toBe('website')
    expect(detectPlatform('example.com')).toBe('website')
  })
})

describe('getUrlDomain', () => {
  it('should return empty string for empty URL', () => {
    expect(getUrlDomain('')).toBe('')
  })

  it('should return hostname for valid URL', () => {
    expect(getUrlDomain('https://example.com/path')).toBe('example.com')
    expect(getUrlDomain('https://www.google.com/search')).toBe('www.google.com')
  })

  it('should return hostname for URL without protocol', () => {
    expect(getUrlDomain('example.com')).toBe('example.com')
  })

  it('should return original string if URL is invalid', () => {
    // Invalid URL falls back to the trimmed string
    expect(getUrlDomain('not a url')).toBe('not a url')
  })
})
