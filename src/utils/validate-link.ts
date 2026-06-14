export const LINK_TITLE_MAX = 30
export const LINK_URL_MAX = 1000

export function validateLinkTitle(title: string, required = false): string {
  if (!required && title.trim().length === 0) return ''
  if (required && title.trim().length === 0) return 'Title is required'
  if (title.trim().length > LINK_TITLE_MAX)
    return `Title must be at most ${LINK_TITLE_MAX} characters`
  return ''
}

export function validateLinkUrl(url: string, required = false): string {
  if (!required && url.trim().length === 0) return ''
  if (required && url.trim().length === 0) return 'URL is required'
  if (url.trim().length > LINK_URL_MAX) return `URL must be at most ${LINK_URL_MAX} characters`
  return ''
}
