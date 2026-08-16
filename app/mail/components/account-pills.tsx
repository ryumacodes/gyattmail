"use client"

import * as React from "react"
import { Check, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface AccountPillsProps {
  isCollapsed: boolean
  accounts: {
    id: string
    label: string
    email: string
    icon: React.ReactNode
    ownerKind?: 'human' | 'agent'
  }[]
  mails: Array<{
    read: boolean
    accountId: string
  }>
  selectedAccount: string
  onAccountChange: (accountId: string) => void
  onAddAccount: () => void
}

export function AccountPills({
  isCollapsed,
  accounts,
  mails,
  selectedAccount,
  onAccountChange,
  onAddAccount,
}: AccountPillsProps) {
  if (isCollapsed) {
    return null
  }

  // Calculate unread counts
  const totalUnread = mails.filter(m => !m.read).length
  const getUnreadCount = (accountId: string) => {
    return mails.filter(m => !m.read && m.accountId === accountId).length
  }

  const currentAccount = selectedAccount === "all"
    ? { label: "All Mails", email: "" }
    : selectedAccount === 'human' ? { label: 'Human mail', email: '' }
    : selectedAccount === 'agent' ? { label: 'Agent mail', email: '' }
    : accounts.find(acc => acc.id === selectedAccount)

  return (
    <div className="px-4 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="hatch-border w-full justify-between h-10 px-3"
          >
            <div className="flex items-center gap-2">
              {selectedAccount !== "all" && currentAccount && 'icon' in currentAccount && (
                <div className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0">
                  {currentAccount.icon}
                </div>
              )}
              <span className="text-sm font-medium">
                {currentAccount?.label || "All Mails"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
          {/* All Mails option */}
          <DropdownMenuItem
            onClick={() => onAccountChange("all")}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">All Mails</span>
              {totalUnread > 0 && (
                <span className="text-xs font-semibold text-hat-600 bg-hat-600/10 px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            {selectedAccount === "all" && (
              <Check className="h-4 w-4 text-hat-600" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => onAccountChange('human')}
            className="flex items-center justify-between"
          >
            <span>Human mail</span>
            {selectedAccount === 'human' && <Check className="h-4 w-4 text-hat-600" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAccountChange('agent')}
            className="flex items-center justify-between"
          >
            <span>Agent mail</span>
            {selectedAccount === 'agent' && <Check className="h-4 w-4 text-hat-600" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Add account option */}
          <DropdownMenuItem
            onClick={onAddAccount}
            className="flex items-center gap-2 text-hat-600"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Connect Email Account</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Individual accounts */}
          {accounts.map((account) => {
            const unreadCount = getUnreadCount(account.id)
            return (
              <DropdownMenuItem
                key={account.email}
                onClick={() => onAccountChange(account.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0">
                    {account.icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{account.label}</span>
                      {unreadCount > 0 && (
                        <span className="text-xs font-semibold text-hat-600 bg-hat-600/10 px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-hatch-600">{account.email}</span>
                  </div>
                </div>
                {selectedAccount === account.id && (
                  <Check className="h-4 w-4 text-hat-600" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
