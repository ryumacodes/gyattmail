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
import { Shield, X } from "lucide-react"
import { useMail } from "@/app/mail/use-mail"
import { useTrustedSenders } from "@/app/mail/use-trusted-senders"

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

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedShowAvatarStacks = localStorage.getItem("gyattmail-showAvatarStacks")
    const savedShowAttachments = localStorage.getItem("gyattmail-showAttachments")
    const savedTheme = localStorage.getItem("gyattmail-theme")
    const savedBlockRemoteImages = localStorage.getItem("gyattmail-blockRemoteImages")

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl paper-grain">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
