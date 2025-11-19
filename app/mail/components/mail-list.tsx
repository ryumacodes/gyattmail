"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { Reply, Archive, Tag, Trash2, Mail as MailIcon, Star } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Mail } from "@/app/mail/data"
import { useMail } from "@/app/mail/use-mail"
import { useMailActions } from "@/app/mail/use-mail-actions"
import { EmptyState } from "@/app/mail/components/empty-state"
import { AddLabelDialog } from "@/app/mail/components/add-label-dialog"
import { AvatarStack } from "@/app/mail/components/avatar-stack"
import { AttachmentIndicator } from "@/app/mail/components/attachment-indicator"

interface MailListProps {
  items: Mail[]
  onReply?: (mail: Mail) => void
}

interface DraggableMailRowProps {
  item: Mail
  index: number
  isSelected: boolean
  isViewing: boolean
  listFontSize: number
  badgeFontSize: number
  scaleFactor: number
  animatingStars: Set<string>
  onItemClick: (mailId: string, index: number, e: React.MouseEvent) => void
  onCheckboxClick: (mailId: string, index: number, e: React.MouseEvent) => void
  onReply: (e: React.MouseEvent, mailId: string) => void
  onArchive: (e: React.MouseEvent, mailId: string) => void
  onOpenLabelDialog: (e: React.MouseEvent, mailId: string) => void
  onTrash: (e: React.MouseEvent, mailId: string) => void
  onToggleRead: (e: React.MouseEvent, mailId: string) => void
  onToggleStar: (e: React.MouseEvent, mailId: string) => void
  showAttachments: boolean
  showAvatarStacks: boolean
}

function DraggableMailRow({
  item,
  index,
  isSelected,
  isViewing,
  listFontSize,
  badgeFontSize,
  scaleFactor,
  animatingStars,
  onItemClick,
  onCheckboxClick,
  onReply,
  onArchive,
  onOpenLabelDialog,
  onTrash,
  onToggleRead,
  onToggleStar,
  showAttachments,
  showAvatarStacks,
}: DraggableMailRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ContextMenu key={item.id}>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...attributes}
          role="button"
          tabIndex={0}
          className={cn(
            "flex items-start gap-3 rounded-[var(--radius)] border-2 p-3 text-left transition-all relative overflow-hidden cursor-pointer",
            isSelected && !isViewing && "bg-accent border-primary shadow-sm",
            isViewing && "bg-card border-primary shadow-letterpress",
            !isSelected && !isViewing && "bg-background border-border hover:bg-accent",
            isDragging && "shadow-lg"
          )}
          style={{ fontSize: `${listFontSize}px`, ...style }}
          onClick={(e) => onItemClick(item.id, index, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onItemClick(item.id, index, e as any)
            }
          }}
        >
          {/* Drag handle - only this part enables dragging */}
          <div
            {...listeners}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-grab active:cursor-grabbing hover:bg-primary/20"
            aria-label="Drag to move"
          />
          {/* Subtle paper grain on viewing */}
          {isViewing && (
            <div className="absolute inset-0 paper-grain pointer-events-none opacity-50" />
          )}

          {/* Checkbox */}
          <div
            className="relative z-10 flex-shrink-0 pt-1"
            onClick={(e) => onCheckboxClick(item.id, index, e)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {}}
              aria-label={`Select email from ${item.name}`}
            />
          </div>

          {/* Mail content */}
          <div className="relative z-10 flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-foreground">{item.name}</div>
                {!item.read && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div
                  className={cn(
                    (isViewing || isSelected)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  style={{ fontSize: `${listFontSize - 2}px` }}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
                <button
                  onClick={(e) => onToggleStar(e, item.id)}
                  className={cn(
                    "transition-all duration-200 hover:scale-110 flex-shrink-0",
                    animatingStars.has(item.id) && "animate-star-bounce"
                  )}
                  aria-label={item.starred ? "Unstar" : "Star"}
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      item.starred
                        ? "fill-primary text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="font-medium text-foreground">{item.subject}</div>
                {item.messageCount && item.messageCount > 1 && (
                  <span
                    className="text-muted-foreground font-normal flex-shrink-0"
                    style={{ fontSize: `${listFontSize - 2}px` }}
                  >
                    ({item.messageCount})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {showAttachments && item.attachments && item.attachments.length > 0 && (
                  <AttachmentIndicator
                    attachments={item.attachments}
                    size={Math.round(16 * scaleFactor)}
                  />
                )}
                {showAvatarStacks && item.participants && item.participants.length > 2 && (
                  <AvatarStack
                    participants={item.participants}
                    maxVisible={5}
                    size={Math.round(20 * scaleFactor)}
                  />
                )}
              </div>
            </div>
            <div
              className="line-clamp-2 text-muted-foreground"
              style={{ fontSize: `${listFontSize - 2}px` }}
            >
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    style={{ fontSize: `${badgeFontSize}px` }}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </ContextMenuTrigger>

      {/* Context Menu */}
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={(e) => onReply(e as any, item.id)}>
          <Reply className="mr-2 h-4 w-4" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => onArchive(e as any, item.id)}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => onOpenLabelDialog(e as any, item.id)}>
          <Tag className="mr-2 h-4 w-4" />
          Add Label
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => onTrash(e as any, item.id)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={(e) => onToggleRead(e as any, item.id)}>
          <MailIcon className="mr-2 h-4 w-4" />
          {item.read ? "Mark as Unread" : "Mark as Read"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function MailList({ items, onReply }: MailListProps) {
  const [mail, setMail] = useMail()
  const { markAsRead, markAsUnread, archiveMail, deleteMail, addLabel, removeLabel, toggleRead, toggleStar } = useMailActions()
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false)
  const [selectedMailForLabel, setSelectedMailForLabel] = React.useState<string | null>(null)
  const [animatingStars, setAnimatingStars] = React.useState<Set<string>>(new Set())

  // Calculate scaled font sizes based on the reader fontSize setting
  const scaleFactor = mail.fontSize / 16 // 16px is the default
  const listFontSize = Math.round(14 * scaleFactor) // Base list font size is 14px
  const badgeFontSize = Math.round(12 * scaleFactor) // Badge font size is 12px

  // Selection handlers
  const toggleSelection = (mailId: string, index: number) => {
    const newSelectedIds = new Set(mail.selectedIds)
    if (newSelectedIds.has(mailId)) {
      newSelectedIds.delete(mailId)
    } else {
      newSelectedIds.add(mailId)
    }
    setMail({
      ...mail,
      selectedIds: newSelectedIds,
      lastSelectedIndex: index,
    })
  }

  const handleSelectRange = (fromIndex: number, toIndex: number) => {
    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const newSelectedIds = new Set(mail.selectedIds)

    for (let i = start; i <= end; i++) {
      if (items[i]) {
        newSelectedIds.add(items[i].id)
      }
    }

    setMail({
      ...mail,
      selectedIds: newSelectedIds,
      lastSelectedIndex: toIndex,
    })
  }

  const handleItemClick = (mailId: string, index: number, e: React.MouseEvent) => {
    // Don't trigger on right-click
    if (e.button === 2) return

    const isCtrlOrCmd = e.ctrlKey || e.metaKey
    const isShift = e.shiftKey

    if (isShift && mail.lastSelectedIndex !== null) {
      // Shift+Click: Select range
      e.preventDefault()
      handleSelectRange(mail.lastSelectedIndex, index)
    } else if (isCtrlOrCmd) {
      // Ctrl/Cmd+Click: Toggle this item
      e.preventDefault()
      toggleSelection(mailId, index)
    } else {
      // Normal click: Toggle email view
      const isCurrentlyViewing = mail.selected === mailId

      // Always create a completely new object to force re-render
      setMail({
        selected: isCurrentlyViewing ? null : mailId,
        selectedIds: new Set<string>(),
        lastSelectedIndex: null,
        fontSize: mail.fontSize,
        showAvatarStacks: mail.showAvatarStacks,
        showAttachments: mail.showAttachments,
        theme: mail.theme,
        blockRemoteImages: mail.blockRemoteImages,
        focusMode: mail.focusMode,
      })

      // Auto-mark as read when opening (like Gmail)
      if (!isCurrentlyViewing) {
        const mailItem = items.find(m => m.id === mailId)
        if (mailItem && !mailItem.read) {
          markAsRead(mailId)
        }
      }
    }
  }

  const handleCheckboxClick = (mailId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSelection(mailId, index)
  }

  const handleReply = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    const mail = items.find(m => m.id === mailId)
    if (mail && onReply) {
      onReply(mail)
    }
  }

  const handleArchive = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    archiveMail(mailId)
  }

  const handleOpenLabelDialog = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    setSelectedMailForLabel(mailId)
    setLabelDialogOpen(true)
  }

  const handleTrash = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    deleteMail(mailId)
  }

  const handleToggleRead = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    toggleRead(mailId)
  }

  const handleToggleStar = (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    toggleStar(mailId)

    // Trigger animation
    setAnimatingStars(prev => new Set(prev).add(mailId))
    setTimeout(() => {
      setAnimatingStars(prev => {
        const next = new Set(prev)
        next.delete(mailId)
        return next
      })
    }, 400) // Match animation duration
  }

  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {items.map((item, index) => {
        const isSelected = mail.selectedIds.has(item.id)
        const isViewing = mail.selected === item.id

        return (
          <DraggableMailRow
            key={item.id}
            item={item}
            index={index}
            isSelected={isSelected}
            isViewing={isViewing}
            listFontSize={listFontSize}
            badgeFontSize={badgeFontSize}
            scaleFactor={scaleFactor}
            animatingStars={animatingStars}
            onItemClick={handleItemClick}
            onCheckboxClick={handleCheckboxClick}
            onReply={handleReply}
            onArchive={handleArchive}
            onOpenLabelDialog={handleOpenLabelDialog}
            onTrash={handleTrash}
            onToggleRead={handleToggleRead}
            onToggleStar={handleToggleStar}
            showAttachments={mail.showAttachments}
            showAvatarStacks={mail.showAvatarStacks}
          />
        )
      })}

      {/* Label Dialog */}
      {selectedMailForLabel && (
        <AddLabelDialog
          open={labelDialogOpen}
          onOpenChange={setLabelDialogOpen}
          mailId={selectedMailForLabel}
          onAddLabel={(label) => addLabel(selectedMailForLabel, label)}
          onRemoveLabel={(label) => removeLabel(selectedMailForLabel, label)}
        />
      )}
    </div>
  )
}
