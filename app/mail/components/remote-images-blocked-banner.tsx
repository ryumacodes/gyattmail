"use client"

import * as React from "react"
import { ImageOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RemoteImagesBlockedBannerProps {
  blockedCount: number
  senderEmail: string
  onShowImages: () => void
  onTrustSender: () => void
}

export function RemoteImagesBlockedBanner({
  blockedCount,
  senderEmail,
  onShowImages,
  onTrustSender,
}: RemoteImagesBlockedBannerProps) {
  const [trustPermanently, setTrustPermanently] = React.useState(false)

  const handleShowImages = () => {
    if (trustPermanently) {
      onTrustSender()
    }
    onShowImages()
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-accent/20 border-2 border-accent rounded-[var(--radius)]">
      {/* Icon */}
      <div className="flex-shrink-0">
        <Shield className="h-5 w-5 text-primary" />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ImageOff className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {blockedCount} remote {blockedCount === 1 ? "image" : "images"} blocked
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Images from external sources are hidden to protect your privacy
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Checkbox
            id="trust-sender"
            checked={trustPermanently}
            onCheckedChange={(checked) => setTrustPermanently(checked as boolean)}
          />
          <Label
            htmlFor="trust-sender"
            className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
          >
            Always trust {senderEmail.split("@")[1]}
          </Label>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleShowImages}
        >
          Show images
        </Button>
      </div>
    </div>
  )
}
