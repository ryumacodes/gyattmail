declare module 'mailparser' {
  export interface AddressObject {
    value: Array<{
      address?: string
      name?: string
    }>
    html: string
    text: string
  }

  export interface Attachment {
    type: string
    content: Buffer
    contentType: string
    partId: string
    release: () => void
    contentDisposition: string
    filename?: string
    headers: Map<string, string>
    checksum: string
    size: number
    contentId?: string
    cid?: string
    related?: boolean
  }

  export interface ParsedMail {
    attachments: Attachment[]
    headers: Map<string, string | string[]>
    subject?: string
    from?: AddressObject
    to?: AddressObject
    cc?: AddressObject
    bcc?: AddressObject
    replyTo?: AddressObject
    date?: Date
    messageId?: string
    inReplyTo?: string
    references?: string | string[]
    html?: string | false
    text?: string
    textAsHtml?: string
    priority?: 'high' | 'normal' | 'low'
  }

  export function simpleParser(source: Buffer | string | NodeJS.ReadableStream): Promise<ParsedMail>
}
