"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Participant {
  name: string
  email: string
  avatar?: string
}

interface AvatarStackProps {
  participants: Participant[]
  maxVisible?: number
  size?: number
}

// Generate consistent color from string
function stringToColor(str: string): string {
  const colors = [
    "hsl(var(--hat-600))",       // Primary accent
    "hsl(210, 60%, 55%)",        // Blue
    "hsl(160, 55%, 50%)",        // Teal
    "hsl(280, 50%, 60%)",        // Purple
    "hsl(30, 70%, 55%)",         // Orange
    "hsl(340, 60%, 55%)",        // Pink
  ]

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function AvatarStack({
  participants,
  maxVisible = 5,
  size = 24
}: AvatarStackProps) {
  const visibleParticipants = participants.slice(0, maxVisible)
  const remainingCount = Math.max(0, participants.length - maxVisible)

  const allNames = participants.map(p => p.name).join(", ")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center -space-x-2 cursor-pointer"
          style={{ height: `${size}px` }}
        >
          {visibleParticipants.map((participant, index) => {
            const initials = getInitials(participant.name)
            const bgColor = stringToColor(participant.email)

            return (
              <Avatar
                key={participant.email + index}
                className="border-2 border-paper-100 transition-transform hover:scale-110 hover:z-10"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              >
                {participant.avatar && (
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                )}
                <AvatarFallback
                  className="text-paper-100 font-semibold"
                  style={{
                    backgroundColor: bgColor,
                    fontSize: `${size * 0.4}px`,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )
          })}

          {remainingCount > 0 && (
            <div
              className="flex items-center justify-center rounded-full border-2 border-paper-100 bg-hatch-600 text-paper-100 font-semibold transition-transform hover:scale-110 hover:z-10"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${size * 0.35}px`,
              }}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="bg-paper-200 border-2 border-hatch-600 text-ink-700 max-w-xs"
        side="top"
      >
        <p className="text-sm font-medium mb-1">
          {participants.length} {participants.length === 1 ? 'participant' : 'participants'}:
        </p>
        <p className="text-xs text-hatch-600">{allNames}</p>
      </TooltipContent>
    </Tooltip>
  )
}
