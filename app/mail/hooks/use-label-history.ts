"use client"

import { useEffect, useState } from "react"

export interface LabelHistoryItem {
  label: string
  lastUsed: number // timestamp
  useCount: number
}

const STORAGE_KEY = "gyattmail-labelHistory"
const MAX_RECENT_LABELS = 10

/**
 * Hook for managing label usage history
 * Tracks recently used labels for quick access
 */
export function useLabelHistory() {
  const [history, setHistory] = useState<LabelHistoryItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as LabelHistoryItem[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error("Failed to load label history:", error)
    } finally {
      setLoaded(true)
    }
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error("Failed to save label history:", error)
      }
    }
  }, [history, loaded])

  /**
   * Add a label to history or update its usage stats
   */
  const addToHistory = (label: string) => {
    setHistory((prev) => {
      const existing = prev.find((item) => item.label === label)

      if (existing) {
        // Update existing entry
        return prev
          .map((item) =>
            item.label === label
              ? { ...item, lastUsed: Date.now(), useCount: item.useCount + 1 }
              : item
          )
          .sort((a, b) => b.lastUsed - a.lastUsed) // Sort by most recent
      } else {
        // Add new entry
        const newHistory = [
          { label, lastUsed: Date.now(), useCount: 1 },
          ...prev,
        ].slice(0, MAX_RECENT_LABELS) // Keep only top N

        return newHistory
      }
    })
  }

  /**
   * Get recent labels sorted by last used
   */
  const getRecentLabels = (limit = 5): string[] => {
    return history
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit)
      .map((item) => item.label)
  }

  /**
   * Clear all history
   */
  const clearHistory = () => {
    setHistory([])
  }

  return {
    history,
    loaded,
    addToHistory,
    getRecentLabels,
    clearHistory,
  }
}
