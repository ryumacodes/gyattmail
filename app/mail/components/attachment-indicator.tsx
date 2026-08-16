"use client"

import * as React from "react"
import { Paperclip } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Attachment {
  name: string
  size: number
  type: string
}

interface AttachmentIndicatorProps {
  attachments: Attachment[]
  size?: number
}

// Format file size in human readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function AttachmentIndicator({
  attachments,
  size = 16
}: AttachmentIndicatorProps) {
  if (!attachments || attachments.length === 0) return null

  const count = attachments.length
  const totalSize = attachments.reduce((acc, att) => acc + att.size, 0)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 text-hatch-600 cursor-pointer hover:text-ink-700 transition-colors">
          <Paperclip
            className="flex-shrink-0"
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
          {count > 1 && (
            <span
              className="font-medium flex-shrink-0"
              style={{ fontSize: `${size * 0.75}px` }}
            >
              {count}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="bg-paper-200 border-2 border-hatch-600 text-ink-700 max-w-xs"
        side="top"
      >
        <p className="text-sm font-medium mb-2">
          {count} {count === 1 ? 'attachment' : 'attachments'} ({formatFileSize(totalSize)})
        </p>
        <div className="space-y-1">
          {attachments.map((attachment, index) => (
            <div key={index} className="text-xs text-hatch-600 flex items-start gap-2">
              <Paperclip className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{attachment.name}</div>
                <div className="text-[10px]">{formatFileSize(attachment.size)}</div>
              </div>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
