"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Shield, X, Sparkles } from "lucide-react"
import { useMail } from "@/app/mail/use-mail"
import { useTrustedSenders } from "@/app/mail/use-trusted-senders"
import { AISettingsPanel } from "@/app/mail/components/ai/ai-settings-panel"
import { DEFAULT_MAIL_PREFERENCES, type MailPreferences } from '@/lib/types/mail-preferences'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const [mail, setMail] = useMail()
  const { trustedSenders, removeTrust, clearAll } = useTrustedSenders()
  const [preferences, setPreferences] = React.useState<MailPreferences>(DEFAULT_MAIL_PREFERENCES)
  const [snippetName, setSnippetName] = React.useState('')
  const [snippetBody, setSnippetBody] = React.useState('')
  const [ruleQuery, setRuleQuery] = React.useState('')
  const [ruleLabel, setRuleLabel] = React.useState('')
  const [viewName, setViewName] = React.useState('')
  const [viewQuery, setViewQuery] = React.useState('')

  React.useEffect(() => {
    void fetch('/api/mail/preferences')
      .then((response) => response.json())
      .then((result) => setPreferences(result.preferences || DEFAULT_MAIL_PREFERENCES))
  }, [])

  const persistPreferences = async (next: MailPreferences) => {
    setPreferences(next)
    await fetch('/api/mail/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
  }

  const addSnippet = () => {
    void persistPreferences({
      ...preferences,
      snippets: [
        ...preferences.snippets,
        { id: crypto.randomUUID(), name: snippetName, body: snippetBody },
      ],
    })
    setSnippetName('')
    setSnippetBody('')
  }

  const addRule = () => {
    void persistPreferences({
      ...preferences,
      rules: [
        ...preferences.rules,
        {
          id: crypto.randomUUID(),
          name: `${ruleQuery} → ${ruleLabel}`,
          enabled: true,
          query: ruleQuery,
          addLabel: ruleLabel,
        },
      ],
    })
    setRuleQuery('')
    setRuleLabel('')
  }

  const addSavedView = () => {
    void persistPreferences({
      ...preferences,
      savedViews: [
        ...preferences.savedViews,
        { id: crypto.randomUUID(), name: viewName, query: viewQuery },
      ],
    })
    setViewName('')
    setViewQuery('')
  }

  const setDesktopNotifications = async (checked: boolean) => {
    if (checked && 'Notification' in window) await Notification.requestPermission()
    await persistPreferences({ ...preferences, desktopNotifications: checked })
  }

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedShowAvatarStacks = localStorage.getItem("gyattmail-showAvatarStacks")
    const savedShowAttachments = localStorage.getItem("gyattmail-showAttachments")
    const savedTheme = localStorage.getItem("gyattmail-theme")
    const savedBlockRemoteImages = localStorage.getItem("gyattmail-blockRemoteImages")
    const savedFocusMode = localStorage.getItem("gyattmail-focusMode")

    if (savedShowAvatarStacks !== null) {
      setMail({ ...mail, showAvatarStacks: savedShowAvatarStacks === "true" })
    }
    if (savedShowAttachments !== null) {
      setMail({ ...mail, showAttachments: savedShowAttachments === "true" })
    }
    if (savedTheme && (savedTheme === "auto" || savedTheme === "light" || savedTheme === "dark")) {
      setMail({ ...mail, theme: savedTheme as "auto" | "light" | "dark" })
    }
    if (savedBlockRemoteImages !== null) {
      setMail({ ...mail, blockRemoteImages: savedBlockRemoteImages === "true" })
    }
    if (savedFocusMode !== null) {
      setMail({ ...mail, focusMode: savedFocusMode === "true" })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFontSizeChange = (value: number[]) => {
    const newFontSize = value[0]
    setMail({ ...mail, fontSize: newFontSize })
    localStorage.setItem("gyattmail-fontSize", newFontSize.toString())
  }

  const handleShowAvatarStacksChange = (checked: boolean) => {
    setMail({ ...mail, showAvatarStacks: checked })
    localStorage.setItem("gyattmail-showAvatarStacks", checked.toString())
  }

  const handleShowAttachmentsChange = (checked: boolean) => {
    setMail({ ...mail, showAttachments: checked })
    localStorage.setItem("gyattmail-showAttachments", checked.toString())
  }

  const handleThemeChange = (value: "auto" | "light" | "dark") => {
    setMail({ ...mail, theme: value })
    localStorage.setItem("gyattmail-theme", value)
  }

  const handleBlockRemoteImagesChange = (checked: boolean) => {
    setMail({ ...mail, blockRemoteImages: checked })
    localStorage.setItem("gyattmail-blockRemoteImages", checked.toString())
  }

  const handleFocusModeChange = (checked: boolean) => {
    setMail({ ...mail, focusMode: checked })
    localStorage.setItem("gyattmail-focusMode", checked.toString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-hatched h-dvh max-w-2xl overflow-y-auto rounded-none p-4 pb-[max(1rem,env(safe-area-inset-bottom))] paper-grain sm:h-auto sm:max-h-[90dvh] sm:rounded-[var(--radius)] sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-serif text-2xl text-foreground">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider border-b-2 border-border pb-2">
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="theme-select"
                  className="text-sm font-medium text-foreground mb-3 block"
                >
                  Theme
                </Label>
                <Select
                  value={mail.theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (follow system)</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose your preferred color scheme or follow your system settings
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4 border-b-2 border-border pb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              Compose &amp; automation
            </h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="default-signature">Default signature</Label>
                <Textarea
                  id="default-signature"
                  className="mt-2"
                  placeholder="Signature appended when sending"
                  value={preferences.signatures.default || ''}
                  onChange={(event) => setPreferences({
                    ...preferences,
                    signatures: { ...preferences.signatures, default: event.target.value },
                  })}
                  onBlur={() => void persistPreferences(preferences)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reusable snippets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Snippet name"
                    value={snippetName}
                    onChange={(event) => setSnippetName(event.target.value)}
                  />
                  <Input
                    placeholder="Saved reply text"
                    value={snippetBody}
                    onChange={(event) => setSnippetBody(event.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" disabled={!snippetName || !snippetBody} onClick={addSnippet}>
                  Add snippet
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Inbox rule</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Search, e.g. from:billing@"
                    value={ruleQuery}
                    onChange={(event) => setRuleQuery(event.target.value)}
                  />
                  <Input
                    placeholder="Label to apply"
                    value={ruleLabel}
                    onChange={(event) => setRuleLabel(event.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" disabled={!ruleQuery || !ruleLabel} onClick={addRule}>
                  Add rule
                </Button>
                <div className="text-xs text-muted-foreground">
                  {preferences.rules.length} active rule{preferences.rules.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Saved view</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="View name"
                    value={viewName}
                    onChange={(event) => setViewName(event.target.value)}
                  />
                  <Input
                    placeholder="Search query"
                    value={viewQuery}
                    onChange={(event) => setViewQuery(event.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" disabled={!viewName || !viewQuery} onClick={addSavedView}>
                  Save view
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Desktop notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify when refreshed mail arrives.</p>
                </div>
                <Switch
                  checked={preferences.desktopNotifications}
                  onCheckedChange={(checked) => void setDesktopNotifications(checked)}
                />
              </div>
              <div>
                <Label>AI extension mode</Label>
                <Select
                  value={preferences.aiExtensionMode}
                  onValueChange={(value: 'built-in' | 'skill' | 'mcp') => void persistPreferences({
                    ...preferences,
                    aiExtensionMode: value,
                  })}
                >
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="built-in">Built-in AI</SelectItem>
                    <SelectItem value="skill">AI skill</SelectItem>
                    <SelectItem value="mcp">MCP server</SelectItem>
                  </SelectContent>
                </Select>
                {preferences.aiExtensionMode === 'mcp' && (
                  <Input
                    className="mt-2"
                    placeholder="https://your-mcp-server.example"
                    value={preferences.mcpEndpoint || ''}
                    onChange={(event) => setPreferences({ ...preferences, mcpEndpoint: event.target.value })}
                    onBlur={() => void persistPreferences(preferences)}
                  />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Reading Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider border-b-2 border-border pb-2">
              Reading
            </h3>
            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Font size
                  </label>
                  <span className="text-sm font-semibold text-foreground bg-background px-3 py-1 rounded-lg border-2 border-border">
                    {mail.fontSize}px
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-muted-foreground">Aa</span>
                    <span className="text-lg font-medium text-muted-foreground">Aa</span>
                  </div>
                  <Slider
                    min={14}
                    max={18}
                    step={1}
                    value={[mail.fontSize]}
                    onValueChange={handleFontSizeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
                    <span>14px</span>
                    <span>16px</span>
                    <span>18px</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Affects both message content and email list
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mail List Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider border-b-2 border-border pb-2">
              Mail List
            </h3>
            <div className="space-y-4">
              {/* Show Avatar Stacks */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="show-avatar-stacks"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Show participant avatars
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display avatar stacks for emails with 3+ participants
                  </p>
                </div>
                <Switch
                  id="show-avatar-stacks"
                  checked={mail.showAvatarStacks}
                  onCheckedChange={handleShowAvatarStacksChange}
                />
              </div>

              {/* Show Attachments */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="show-attachments"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Show attachment indicators
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display paperclip icon and file count for emails with attachments
                  </p>
                </div>
                <Switch
                  id="show-attachments"
                  checked={mail.showAttachments}
                  onCheckedChange={handleShowAttachmentsChange}
                />
              </div>

              {/* Focus Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="focus-mode"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Focus mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hide mail list when viewing an email (desktop only, press V to toggle)
                  </p>
                </div>
                <Switch
                  id="focus-mode"
                  checked={mail.focusMode}
                  onCheckedChange={handleFocusModeChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy & Security Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider border-b-2 border-border pb-2">
              Privacy &amp; Security
            </h3>
            <div className="space-y-4">
              {/* Block Remote Images */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="block-remote-images"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Block remote images by default
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Prevent tracking and protect privacy by blocking external images
                  </p>
                </div>
                <Switch
                  id="block-remote-images"
                  checked={mail.blockRemoteImages}
                  onCheckedChange={handleBlockRemoteImagesChange}
                />
              </div>

              {/* Trusted Senders List */}
              {trustedSenders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Trusted senders ({trustedSenders.length})
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="h-7 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These senders can load remote images automatically
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto border-2 border-border rounded-lg p-3">
                    {trustedSenders.map((sender) => (
                      <div
                        key={sender.identifier}
                        className="flex items-center justify-between gap-2 group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">
                            {sender.identifier}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({sender.type})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrust(sender.identifier)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove trust</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* AI Features Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider border-b-2 border-border pb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Features
            </h3>
            <AISettingsPanel />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
