export interface MailSnippet {
  id: string
  name: string
  body: string
}

export interface MailRule {
  id: string
  name: string
  enabled: boolean
  query: string
  addLabel?: string
  markRead?: boolean
  archive?: boolean
}

export interface SavedMailView {
  id: string
  name: string
  query: string
}

export interface MailPreferences {
  signatures: Record<string, string>
  snippets: MailSnippet[]
  rules: MailRule[]
  savedViews: SavedMailView[]
  desktopNotifications: boolean
  aiExtensionMode: 'built-in' | 'skill' | 'mcp'
  mcpEndpoint?: string
}

export const DEFAULT_MAIL_PREFERENCES: MailPreferences = {
  signatures: {},
  snippets: [],
  rules: [],
  savedViews: [],
  desktopNotifications: false,
  aiExtensionMode: 'built-in',
}
