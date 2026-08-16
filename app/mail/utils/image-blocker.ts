/**
 * Image Blocker Utility
 *
 * Detects and blocks remote images in email HTML content for privacy protection.
 * Replaces external image URLs with placeholder data URIs.
 */

export interface ImageBlockResult {
  blockedHtml: string
  blockedCount: number
  blockedImages: {url: string, type: 'img' | 'background'}[]
}

// Placeholder SVG for blocked images
const BLOCKED_IMAGE_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23E8DDC9'/%3E%3Cpath d='M30 40 L50 60 L70 40 M50 60 L50 80' stroke='%237A6857' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='30' r='8' stroke='%237A6857' stroke-width='2' fill='none'/%3E%3C/svg%3E`

/**
 * Checks if a URL is an external/remote image that should be blocked
 */
export function isRemoteImage(src: string): boolean {
  if (!src) return false

  const trimmed = src.trim().toLowerCase()

  // Don't block these types:
  // 1. Data URIs (embedded images)
  if (trimmed.startsWith('data:')) return false

  // 2. Content-ID references (inline attachments)
  if (trimmed.startsWith('cid:')) return false

  // 3. Relative URLs (shouldn't happen in emails, but just in case)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false

  // Block everything else (http:// and https:// URLs)
  return true
}

/**
 * Blocks remote images in HTML content
 * Returns modified HTML and metadata about blocked images
 */
export function blockRemoteImages(html: string): ImageBlockResult {
  const blockedImages: {url: string, type: 'img' | 'background'}[] = []
  let blockedCount = 0

  // Create a temporary div to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Block <img> tags
  const images = doc.querySelectorAll('img')
  images.forEach((img) => {
    const src = img.getAttribute('src')
    if (src && isRemoteImage(src)) {
      blockedImages.push({ url: src, type: 'img' })
      img.setAttribute('data-original-src', src)
      img.setAttribute('src', BLOCKED_IMAGE_PLACEHOLDER)
      img.setAttribute('data-blocked', 'true')
      blockedCount++
    }
  })

  // Block CSS background images
  const elementsWithStyle = doc.querySelectorAll('[style*="background"]')
  elementsWithStyle.forEach((element) => {
    const style = element.getAttribute('style') || ''
    const bgImageMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?(https?:\/\/[^'")]+)['"]?\)/i)

    if (bgImageMatch) {
      const url = bgImageMatch[1]
      if (isRemoteImage(url)) {
        blockedImages.push({ url, type: 'background' })
        element.setAttribute('data-original-style', style)
        const newStyle = style.replace(
          /background(?:-image)?\s*:\s*url\(['"]?https?:\/\/[^'")]+['"]?\)/gi,
          `background-image: url('${BLOCKED_IMAGE_PLACEHOLDER}')`
        )
        element.setAttribute('style', newStyle)
        element.setAttribute('data-blocked', 'true')
        blockedCount++
      }
    }
  })

  // Serialize back to HTML
  const blockedHtml = doc.body.innerHTML

  return {
    blockedHtml,
    blockedCount,
    blockedImages,
  }
}

/**
 * Unblocks images - restores original URLs
 */
export function unblockImages(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Restore <img> tags
  const blockedImages = doc.querySelectorAll('img[data-blocked="true"]')
  blockedImages.forEach((img) => {
    const originalSrc = img.getAttribute('data-original-src')
    if (originalSrc) {
      img.setAttribute('src', originalSrc)
      img.removeAttribute('data-blocked')
      img.removeAttribute('data-original-src')
    }
  })

  // Restore CSS background images
  const blockedElements = doc.querySelectorAll('[data-blocked="true"][data-original-style]')
  blockedElements.forEach((element) => {
    const originalStyle = element.getAttribute('data-original-style')
    if (originalStyle) {
      element.setAttribute('style', originalStyle)
      element.removeAttribute('data-blocked')
      element.removeAttribute('data-original-style')
    }
  })

  return doc.body.innerHTML
}

/**
 * Checks if email HTML contains any remote images
 */
export function hasRemoteImages(html: string): boolean {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Check <img> tags
  const images = doc.querySelectorAll('img')
  for (const img of images) {
    const src = img.getAttribute('src')
    if (src && isRemoteImage(src)) {
      return true
    }
  }

  // Check CSS background images
  const elementsWithStyle = doc.querySelectorAll('[style*="background"]')
  for (const element of elementsWithStyle) {
    const style = element.getAttribute('style') || ''
    const bgImageMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?(https?:\/\/[^'")]+)['"]?\)/i)
    if (bgImageMatch && isRemoteImage(bgImageMatch[1])) {
      return true
    }
  }

  return false
}
