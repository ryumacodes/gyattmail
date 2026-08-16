"use client"

import { useTheme } from "@/lib/use-theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // This component simply calls useTheme to initialize theme handling
  useTheme()

  return <>{children}</>
}
