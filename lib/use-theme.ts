"use client"

import { useEffect } from "react"
import { useMail } from "@/app/mail/use-mail"

export function useTheme() {
  const [mail, setMail] = useMail()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("gyattmail-theme")
    if (savedTheme && (savedTheme === "auto" || savedTheme === "light" || savedTheme === "dark")) {
      setMail({ ...mail, theme: savedTheme as "auto" | "light" | "dark" })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    if (mail.theme === "auto") {
      // Use system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      if (systemTheme === "dark") {
        root.classList.add("dark")
      }
    } else {
      // Use explicit theme
      if (mail.theme === "dark") {
        root.classList.add("dark")
      }
    }
  }, [mail.theme])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (mail.theme !== "auto") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      if (e.matches) {
        root.classList.add("dark")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [mail.theme])

  const setTheme = (theme: "auto" | "light" | "dark") => {
    setMail({ ...mail, theme })
    localStorage.setItem("gyattmail-theme", theme)
  }

  return {
    theme: mail.theme,
    setTheme,
  }
}
