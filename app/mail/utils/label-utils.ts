import type { Mail } from "@/app/mail/data"

export interface LabelWithCount {
  label: string
  count: number
}

/**
 * Get all unique labels from mails with their counts
 */
export function getAllLabelsWithCounts(mails: Mail[]): LabelWithCount[] {
  const labelCounts = new Map<string, number>()

  mails.forEach((mail) => {
    mail.labels.forEach((label) => {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
    })
  })

  return Array.from(labelCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Get count of emails with a specific label
 */
export function getLabelCount(mails: Mail[], label: string): number {
  return mails.filter((mail) => mail.labels.includes(label)).length
}

/**
 * Get all unique labels sorted alphabetically
 */
export function getAllLabels(mails: Mail[]): string[] {
  const labels = new Set<string>()

  mails.forEach((mail) => {
    mail.labels.forEach((label) => {
      labels.add(label)
    })
  })

  return Array.from(labels).sort((a, b) => a.localeCompare(b))
}

/**
 * Filter mails by label
 */
export function filterMailsByLabel(mails: Mail[], label: string): Mail[] {
  return mails.filter((mail) => mail.labels.includes(label))
}
