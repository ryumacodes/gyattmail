/**
 * AI Summary Card Component
 * Displays AI-generated email summary with priority, sentiment, and action items
 */

'use client'

import * as React from 'react'
import { Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EmailPriority, EmailSentiment } from '@/lib/ai/types'

interface AISummaryCardProps {
  summary: string
  priority?: EmailPriority
  priorityConfidence?: number
  sentiment?: EmailSentiment
  sentimentConfidence?: number
  actionItems?: Array<{
    task: string
    deadline?: string | null
    priority?: 'low' | 'medium' | 'high'
  }>
  estimatedCost?: number
  cached?: boolean
  onDismiss?: () => void
}

export function AISummaryCard({
  summary,
  priority,
  priorityConfidence,
  sentiment,
  sentimentConfidence,
  actionItems = [],
  estimatedCost,
  cached = false,
  onDismiss,
}: AISummaryCardProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  const getPriorityColor = (p: EmailPriority) => {
    switch (p) {
      case 'urgent':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getSentimentEmoji = (s: EmailSentiment) => {
    switch (s) {
      case 'positive':
        return '😊'
      case 'neutral':
        return '😐'
      case 'negative':
        return '😟'
      case 'mixed':
        return '🤔'
    }
  }

  return (
    <div className="border-2 border-hatch-400 bg-paper-100 paper-grain rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-paper-200 border-b-2 border-hatch-400">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ink-700" />
          <span className="text-sm font-semibold text-ink-700">AI Summary</span>
          {cached && (
            <span className="text-xs text-ink-500">(cached)</span>
          )}
          {estimatedCost !== undefined && estimatedCost > 0 && (
            <span className="text-xs text-ink-500">
              (${estimatedCost.toFixed(4)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 space-y-3">
          {/* Summary Text */}
          <p className="text-sm text-ink-700 leading-relaxed">{summary}</p>

          {/* Priority and Sentiment Badges */}
          {(priority || sentiment) && (
            <div className="flex items-center gap-2 flex-wrap">
              {priority && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium ${getPriorityColor(priority)}`}
                >
                  <span className="font-semibold">Priority:</span>
                  <span className="capitalize">{priority}</span>
                  {priorityConfidence && (
                    <span className="opacity-70">
                      ({Math.round(priorityConfidence * 100)}%)
                    </span>
                  )}
                </div>
              )}

              {sentiment && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border bg-gray-100 border-gray-300 text-gray-700 text-xs font-medium">
                  <span>{getSentimentEmoji(sentiment)}</span>
                  <span className="font-semibold">Tone:</span>
                  <span className="capitalize">{sentiment}</span>
                  {sentimentConfidence && (
                    <span className="opacity-70">
                      ({Math.round(sentimentConfidence * 100)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-ink-600 mb-2">
                ✅ Action Items:
              </h4>
              <ul className="space-y-1.5">
                {actionItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-ink-700"
                  >
                    <span className="text-ink-500 mt-0.5">•</span>
                    <div className="flex-1">
                      <span>{item.task}</span>
                      {item.deadline && (
                        <span className="text-xs text-ink-500 ml-2">
                          (by {item.deadline})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
