"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["↑"], description: "Previous mail" },
      { keys: ["↓"], description: "Next mail" },
      { keys: ["Enter"], description: "Open mail" },
      { keys: ["Esc"], description: "Close mail" },
      { keys: ["/"], description: "Search" },
    ],
  },
  {
    category: "Actions",
    items: [
      { keys: ["c"], description: "Compose new mail" },
      { keys: ["r"], description: "Reply" },
      { keys: ["a"], description: "Reply all" },
      { keys: ["f"], description: "Forward" },
    ],
  },
  {
    category: "Organization",
    items: [
      { keys: ["#"], description: "Delete" },
      { keys: ["e"], description: "Archive" },
      { keys: ["!"], description: "Mark as spam" },
      { keys: ["Shift", "i"], description: "Mark as read" },
      { keys: ["Shift", "u"], description: "Mark as unread" },
    ],
  },
  {
    category: "View",
    items: [
      { keys: ["v"], description: "Toggle focus mode" },
      { keys: ["Ctrl", "/"], description: "Toggle shortcuts" },
    ],
  },
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl paper-grain">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-serif text-2xl text-ink-700">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-xs font-semibold text-ink-700 mb-3 uppercase tracking-wider border-b-2 border-hatch-600 pb-2">
                {section.category}
              </h3>
              <div className="grid gap-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-hatch-600">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2.5 py-1 text-xs font-semibold text-ink-700 bg-paper-100 border-2 border-hatch-600 rounded-[var(--radius)] shadow-sm min-w-[28px] text-center">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-xs text-hatch-600 flex items-center px-0.5">
                              then
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
