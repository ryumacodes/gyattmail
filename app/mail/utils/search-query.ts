import type { Mail } from '../data'

export function matchesSearchQuery(mail: Mail, rawQuery: string): boolean {
  const query = rawQuery.trim()
  if (!query) return true
  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []
  return tokens.every((token) => {
    const separator = token.indexOf(':')
    const key = separator > 0 ? token.slice(0, separator).toLowerCase() : ''
    const value = (separator > 0 ? token.slice(separator + 1) : token).replace(/^"|"$/g, '').toLowerCase()
    if (key === 'from') return `${mail.name} ${mail.email}`.toLowerCase().includes(value)
    if (key === 'subject') return mail.subject.toLowerCase().includes(value)
    if (key === 'label') return mail.labels.some((label) => label.toLowerCase().includes(value))
    if (key === 'account') return mail.accountId.toLowerCase().includes(value)
    if (key === 'is') {
      if (value === 'unread') return !mail.read
      if (value === 'read') return mail.read
      if (value === 'starred') return mail.starred
      if (value === 'archived') return mail.archived
      if (value === 'trash') return mail.deleted
    }
    if (key === 'has' && value === 'attachment') return Boolean(mail.attachments?.length)
    if (key === 'after') return new Date(mail.date).getTime() >= new Date(value).getTime()
    if (key === 'before') return new Date(mail.date).getTime() <= new Date(value).getTime()
    return `${mail.name} ${mail.email} ${mail.subject} ${mail.text} ${mail.labels.join(' ')}`.toLowerCase().includes(value)
  })
}
