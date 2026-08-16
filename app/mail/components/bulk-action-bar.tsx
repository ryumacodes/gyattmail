"use client"

import * as React from "react"
import { Archive, Trash2, Mail, MailOpen, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMailActions } from "@/app/mail/use-mail-actions"
import { useMail } from "@/app/mail/use-mail"

interface BulkActionBarProps {
  selectedIds: Set<string>
  onClearSelection: () => void
  totalCount: number
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  totalCount,
}: BulkActionBarProps) {
  const {
    archiveMultiple,
    deleteMultiple,
    markMultipleAsRead,
    markMultipleAsUnread,
  } = useMailActions()
  const [mail, setMail] = useMail()

  const selectedCount = selectedIds.size

  if (selectedCount === 0) return null

  const selectedArray = Array.from(selectedIds)

  const handleArchive = () => {
    archiveMultiple(selectedArray)
    onClearSelection()
  }

  const handleDelete = () => {
    deleteMultiple(selectedArray)
    onClearSelection()
  }

  const handleMarkRead = () => {
    markMultipleAsRead(selectedArray)
    // Don't clear selection - user might want to do more
  }

  const handleMarkUnread = () => {
    markMultipleAsUnread(selectedArray)
    // Don't clear selection - user might want to do more
  }

  const handleSelectAll = () => {
    // This will be handled by parent component
  }

  return (
    <div className="sticky top-0 z-50 bg-paper-200 border-b-2 border-hatch-600 px-2 py-2 paper-grain @container">
      <div className="flex items-center gap-1 @lg:gap-3">
        {/* Selection count */}
        <div className="flex items-center gap-1 @md:gap-2 text-xs @md:text-sm font-medium text-ink-700 flex-shrink-0">
          <span className="bg-hat-600 text-paper-100 px-1.5 @md:px-2 py-0.5 @md:py-1 rounded-lg text-xs">
            {selectedCount}
          </span>
          <span className="hidden @sm:inline text-xs @md:text-sm">
            {selectedCount === 1 ? 'mail' : 'mails'}
          </span>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-hatch-600 hidden @md:block" />

        {/* Action buttons */}
        <div className="flex items-center gap-1 @md:gap-2 flex-1 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            className="gap-1 h-7 @md:h-8 flex-shrink-0"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5 @md:h-4 @md:w-4" />
            <span className="hidden @xl:inline">Archive</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="gap-1 h-7 @md:h-8 flex-shrink-0"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 @md:h-4 @md:w-4" />
            <span className="hidden @xl:inline">Delete</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkRead}
            className="gap-1 h-7 @md:h-8 flex-shrink-0"
            title="Mark read"
          >
            <MailOpen className="h-3.5 w-3.5 @md:h-4 @md:w-4" />
            <span className="hidden @2xl:inline">Read</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkUnread}
            className="gap-1 h-7 @md:h-8 flex-shrink-0"
            title="Mark unread"
          >
            <Mail className="h-3.5 w-3.5 @md:h-4 @md:w-4" />
            <span className="hidden @2xl:inline">Unread</span>
          </Button>
        </div>

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-1 h-7 @md:h-8 flex-shrink-0"
          title="Clear selection"
        >
          <X className="h-3.5 w-3.5 @md:h-4 @md:w-4" />
          <span className="hidden @md:inline">Clear</span>
        </Button>
      </div>
    </div>
  )
}
