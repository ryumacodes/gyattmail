/**
 * Email parser utilities for detecting quoted text, replies, and forwards
 */

export interface QuotedSection {
  startIndex: number
  endIndex: number
  type: "reply" | "forward" | "quote"
  level: number // Nesting level for quotes
}

export interface ParsedEmail {
  originalText: string
  mainContent: string
  quotedSections: QuotedSection[]
}

/**
 * Common patterns for detecting quoted text in emails
 */
const QUOTE_PATTERNS = {
  // Gmail-style: "On Mon, Jan 1, 2025 at 10:00 AM, John Doe <john@example.com> wrote:"
  gmail: /^On .+? wrote:$/m,

  // Outlook-style: "From: John Doe" or "-----Original Message-----"
  outlook: /^-+Original Message-+$/m,
  outlookFrom: /^From:\s*.+$/m,

  // Forwarded message
  forwarded: /^-+ Forwarded message -+$/m,

  // Quote markers: lines starting with > or |
  quoteLine: /^[>|]\s?/,

  // Common "wrote:" patterns
  wrote: /^.+\s+wrote:$/m,
}

/**
 * Detect if a line is a quoted line (starts with > or |)
 */
function isQuotedLine(line: string): boolean {
  return QUOTE_PATTERNS.quoteLine.test(line.trim())
}

/**
 * Get the quote level of a line (number of > or | markers)
 */
function getQuoteLevel(line: string): number {
  const trimmed = line.trim()
  let level = 0
  for (const char of trimmed) {
    if (char === ">" || char === "|") {
      level++
    } else if (char !== " ") {
      break
    }
  }
  return level
}

/**
 * Detect if a line is a reply/forward header
 */
function isReplyHeader(line: string): boolean {
  const trimmed = line.trim()
  return (
    QUOTE_PATTERNS.gmail.test(trimmed) ||
    QUOTE_PATTERNS.outlook.test(trimmed) ||
    QUOTE_PATTERNS.forwarded.test(trimmed) ||
    QUOTE_PATTERNS.outlookFrom.test(trimmed) ||
    QUOTE_PATTERNS.wrote.test(trimmed)
  )
}

/**
 * Determine the type of quoted section based on header
 */
function getQuoteType(header: string): "reply" | "forward" | "quote" {
  if (QUOTE_PATTERNS.forwarded.test(header)) {
    return "forward"
  }
  if (QUOTE_PATTERNS.gmail.test(header) || QUOTE_PATTERNS.wrote.test(header)) {
    return "reply"
  }
  return "quote"
}

/**
 * Parse email content to detect quoted sections
 */
export function parseEmail(text: string): ParsedEmail {
  const lines = text.split("\n")
  const quotedSections: QuotedSection[] = []

  let currentSection: QuotedSection | null = null
  let mainContentLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Check if this is a reply/forward header
    if (isReplyHeader(trimmedLine)) {
      // If we have an active section, close it
      if (currentSection) {
        currentSection.endIndex = i - 1
        quotedSections.push(currentSection)
      }

      // Start a new section
      currentSection = {
        startIndex: i,
        endIndex: i,
        type: getQuoteType(trimmedLine),
        level: 0,
      }
      continue
    }

    // Check if this is a quoted line (starts with > or |)
    if (isQuotedLine(trimmedLine)) {
      const level = getQuoteLevel(trimmedLine)

      if (!currentSection) {
        // Start a new quote section
        currentSection = {
          startIndex: i,
          endIndex: i,
          type: "quote",
          level,
        }
      } else {
        // Continue existing section
        currentSection.endIndex = i
        // Update level if deeper
        currentSection.level = Math.max(currentSection.level, level)
      }
      continue
    }

    // If line is empty and we have a current section, continue it
    if (trimmedLine === "" && currentSection) {
      currentSection.endIndex = i
      continue
    }

    // Non-quoted, non-empty line
    if (trimmedLine !== "") {
      // If we have an active section, close it
      if (currentSection) {
        // Only close if we've seen at least 2 lines (header + content)
        if (currentSection.endIndex - currentSection.startIndex >= 1) {
          quotedSections.push(currentSection)
          currentSection = null
        } else {
          // False positive, abandon this section
          currentSection = null
        }
      }

      // Add to main content if not in a section
      if (!currentSection) {
        mainContentLines.push(line)
      }
    }
  }

  // Close any remaining section
  if (currentSection && currentSection.endIndex - currentSection.startIndex >= 1) {
    quotedSections.push(currentSection)
  }

  return {
    originalText: text,
    mainContent: mainContentLines.join("\n"),
    quotedSections,
  }
}

/**
 * Extract quoted sections from email text
 */
export function getQuotedSections(text: string): string[] {
  const parsed = parseEmail(text)
  const lines = text.split("\n")

  return parsed.quotedSections.map((section) => {
    return lines.slice(section.startIndex, section.endIndex + 1).join("\n")
  })
}

/**
 * Get the main content without quoted sections
 */
export function getMainContent(text: string): string {
  const parsed = parseEmail(text)
  return parsed.mainContent.trim()
}

/**
 * Count the number of quoted replies in the email
 */
export function countQuotedReplies(text: string): number {
  const parsed = parseEmail(text)
  return parsed.quotedSections.length
}

/**
 * Check if email has quoted content
 */
export function hasQuotedContent(text: string): boolean {
  const parsed = parseEmail(text)
  return parsed.quotedSections.length > 0
}
