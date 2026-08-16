"use client"

import { useEffect, useState } from "react"

export interface TrustedSender {
  identifier: string // email address or domain (*.example.com)
  type: "email" | "domain"
  trustedAt: number // timestamp
}

const STORAGE_KEY = "gyattmail-trustedSenders"

/**
 * Hook for managing trusted senders list
 * Trusted senders are allowed to load remote images
 */
export function useTrustedSenders() {
  const [trustedSenders, setTrustedSenders] = useState<TrustedSender[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as TrustedSender[]
        setTrustedSenders(parsed)
      }
    } catch (error) {
      console.error("Failed to load trusted senders:", error)
    } finally {
      setLoaded(true)
    }
  }, [])

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trustedSenders))
      } catch (error) {
        console.error("Failed to save trusted senders:", error)
      }
    }
  }, [trustedSenders, loaded])

  /**
   * Check if an email address is from a trusted sender
   */
  const isTrusted = (email: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim()

    for (const sender of trustedSenders) {
      if (sender.type === "email") {
        // Exact email match
        if (sender.identifier === normalizedEmail) {
          return true
        }
      } else if (sender.type === "domain") {
        // Domain match (*.example.com)
        const domain = normalizedEmail.split("@")[1]
        if (domain && sender.identifier === `*.${domain}`) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Trust a specific email address
   */
  const trustEmail = (email: string) => {
    const normalizedEmail = email.toLowerCase().trim()

    // Don't add if already trusted
    if (isTrusted(normalizedEmail)) {
      return
    }

    const newSender: TrustedSender = {
      identifier: normalizedEmail,
      type: "email",
      trustedAt: Date.now(),
    }

    setTrustedSenders((prev) => [...prev, newSender])
  }

  /**
   * Trust all emails from a domain
   */
  const trustDomain = (email: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    const domain = normalizedEmail.split("@")[1]

    if (!domain) {
      console.error("Invalid email address:", email)
      return
    }

    const domainPattern = `*.${domain}`

    // Don't add if already trusted
    if (trustedSenders.some((s) => s.identifier === domainPattern)) {
      return
    }

    const newSender: TrustedSender = {
      identifier: domainPattern,
      type: "domain",
      trustedAt: Date.now(),
    }

    setTrustedSenders((prev) => [...prev, newSender])
  }

  /**
   * Remove trust for a specific identifier
   */
  const removeTrust = (identifier: string) => {
    setTrustedSenders((prev) =>
      prev.filter((s) => s.identifier !== identifier)
    )
  }

  /**
   * Clear all trusted senders
   */
  const clearAll = () => {
    setTrustedSenders([])
  }

  return {
    trustedSenders,
    loaded,
    isTrusted,
    trustEmail,
    trustDomain,
    removeTrust,
    clearAll,
  }
}
