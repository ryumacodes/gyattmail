"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccountSwitcherProps {
  isCollapsed: boolean
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
}

export function AccountSwitcher({
  isCollapsed,
}: AccountSwitcherProps) {
  return (
    <h1 className={cn(
      "font-serif font-bold text-foreground text-xl",
      isCollapsed && "hidden"
    )}>
      gyattmail
    </h1>
  )
}
