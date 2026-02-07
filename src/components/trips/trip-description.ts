/**
 * Extracts a Gmail link from the description if present.
 * Looks for URLs starting with "mail.google.com" or "https://mail.google"
 */
export function extractGmailLink(description?: string): string | null {
  if (!description) return null

  // Match URLs in href attributes or plain text
  const hrefMatch = description.match(/href=["']?(https?:\/\/mail\.google\.com[^"'\s<>]*)/i)
  if (hrefMatch) return hrefMatch[1]

  // Match plain URL
  const plainMatch = description.match(/(https?:\/\/mail\.google\.com[^\s<>"']*)/i)
  if (plainMatch) return plainMatch[1]

  return null
}

/**
 * Removes Gmail links from the description (including surrounding <a> tags).
 */
export function stripGmailLink(description?: string): string {
  if (!description) return ''

  let cleaned = description

  // Remove <a> tags containing mail.google.com
  cleaned = cleaned.replace(/<a[^>]*href=["']?https?:\/\/mail\.google\.com[^"']*["']?[^>]*>.*?<\/a>/gi, '')

  // Remove plain mail.google.com URLs
  cleaned = cleaned.replace(/https?:\/\/mail\.google\.com[^\s<>"']*/gi, '')

  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim()

  return cleaned
}
