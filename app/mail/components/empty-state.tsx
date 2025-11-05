import * as React from "react"
import { CheckCircle2 } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
      <div className="relative mb-6">
        {/* Main icon */}
        <CheckCircle2 className="h-16 w-16 text-hat-600" strokeWidth={1.5} />
      </div>

      <h2 className="text-2xl font-serif font-bold text-ink-700 mb-6">
        All caught up!
      </h2>

      <div className="flex flex-col gap-2 text-xs text-hatch-600 items-center">
        <span className="px-3 py-1.5 rounded-full border-2 border-hat-600 bg-hat-600/10 text-hat-700 font-medium">
          Nice work!
        </span>
      </div>
    </div>
  )
}
