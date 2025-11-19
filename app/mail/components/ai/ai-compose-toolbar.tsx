/**
 * AI Compose Toolbar Component
 * Provides AI-powered writing assistance in the compose dialog
 */

'use client'

import * as React from 'react'
import { Sparkles, Wand2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { EmailTone, EmailLength } from '@/lib/ai/types'

interface AIComposeToolbarProps {
  body: string
  onBodyChange: (body: string) => void
  to?: string
  subject?: string
  replyTo?: {
    from: string
    subject: string
    body: string
  }
}

export function AIComposeToolbar({
  body,
  onBodyChange,
  to,
  subject,
  replyTo,
}: AIComposeToolbarProps) {
  const [showDraftDialog, setShowDraftDialog] = React.useState(false)
  const [draftPrompt, setDraftPrompt] = React.useState('')
  const [draftTone, setDraftTone] = React.useState<EmailTone>('professional')
  const [draftLength, setDraftLength] = React.useState<EmailLength>('medium')
  const [loading, setLoading] = React.useState(false)

  const handleGenerateDraft = async () => {
    if (!draftPrompt.trim()) {
      toast.error('Please enter what you want to write about')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/ai/compose/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: to || '',
          purpose: draftPrompt,
          tone: draftTone,
          length: draftLength,
          replyTo,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate draft')
      }

      onBodyChange(data.data.body)
      setShowDraftDialog(false)
      setDraftPrompt('')
      toast.success('Draft generated successfully!')
    } catch (error) {
      console.error('Draft generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate draft')
    } finally {
      setLoading(false)
    }
  }

  const handleImprove = async () => {
    if (!body.trim()) {
      toast.error('Please write some text first')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/ai/compose/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: body,
          improvements: ['grammar', 'clarity', 'conciseness'],
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to improve text')
      }

      onBodyChange(data.data.improvedText)
      toast.success('Text improved!')
    } catch (error) {
      console.error('Improve text error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to improve text')
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustTone = async (targetTone: EmailTone) => {
    if (!body.trim()) {
      toast.error('Please write some text first')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/ai/compose/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: body,
          targetTone,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to adjust tone')
      }

      onBodyChange(data.data.adjustedText)
      toast.success(`Tone adjusted to ${targetTone}!`)
    } catch (error) {
      console.error('Tone adjustment error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to adjust tone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-paper-200 border-2 border-hatch-400 rounded mb-2">
        <div className="flex items-center gap-1.5 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDraftDialog(true)}
            disabled={loading}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Draft
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleImprove}
            disabled={loading || !body.trim()}
            className="text-xs gap-1.5"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Improve
          </Button>

          <Select onValueChange={(value) => handleAdjustTone(value as EmailTone)}>
            <SelectTrigger className="h-7 w-auto text-xs border-hatch-400">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <RefreshCw className="h-3.5 w-3.5 text-ink-600 animate-spin" />
        )}
      </div>

      {/* Draft Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent className="sm:max-w-[500px] bg-paper-200 border-hatched paper-grain">
          <DialogHeader>
            <DialogTitle className="font-serif text-ink-700">Generate Email Draft</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="prompt" className="text-ink-700">
                What would you like to write about?
              </Label>
              <Textarea
                id="prompt"
                placeholder="E.g., Reply accepting the meeting invite and suggest Wednesday at 2pm"
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                className="mt-2 border-hatch-400 bg-paper-100 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone" className="text-ink-700">
                  Tone
                </Label>
                <Select value={draftTone} onValueChange={(v) => setDraftTone(v as EmailTone)}>
                  <SelectTrigger id="tone" className="mt-2 border-hatch-400 bg-paper-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length" className="text-ink-700">
                  Length
                </Label>
                <Select value={draftLength} onValueChange={(v) => setDraftLength(v as EmailLength)}>
                  <SelectTrigger id="length" className="mt-2 border-hatch-400 bg-paper-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (2-3 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (1-2 paragraphs)</SelectItem>
                    <SelectItem value="long">Long (3-4 paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDraftDialog(false)}
              disabled={loading}
              className="border-hatch-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDraft}
              disabled={loading || !draftPrompt.trim()}
              className="bg-ink-700 hover:bg-ink-800 text-paper-100"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
