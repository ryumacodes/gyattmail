"use client"

import * as React from "react"
import { AlertCircle, X, RefreshCw, LogIn } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConnectionErrorBannerProps {
  accountLabel: string
  accountEmail: string
  error: string
  onRetry: () => void
  onDismiss: () => void
  isRetrying?: boolean
  isOAuthError?: boolean
}

export function ConnectionErrorBanner({
  accountLabel,
  accountEmail,
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  isOAuthError = false,
}: ConnectionErrorBannerProps) {
  return (
    <div className="px-4 my-2">
      <Alert variant="destructive" className="px-4 py-3">
        <div className="flex items-center w-full gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div className="flex items-center justify-between flex-1 gap-4">
            <div className="flex-1 min-w-0">
              <AlertTitle className="font-serif">
                {isOAuthError ? "Authentication Expired" : "Connection Failed"}: {accountLabel}
              </AlertTitle>
              <AlertDescription className="mt-1 text-xs">
                <span className="font-medium">{accountEmail}</span> · {
                  isOAuthError
                    ? "Your login session has expired. Please sign in again."
                    : error
                }
              </AlertDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={isRetrying}
                className={cn(
                  "h-7 text-xs border-berry-500 text-berry-500 hover:bg-berry-500/10",
                  isRetrying && "opacity-50"
                )}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    {isOAuthError ? "Redirecting..." : "Retrying..."}
                  </>
                ) : (
                  <>
                    {isOAuthError ? (
                      <>
                        <LogIn className="h-3 w-3 mr-1" />
                        Sign In Again
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </>
                    )}
                  </>
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onDismiss}
                className="h-7 w-7 text-berry-500 hover:bg-berry-500/10"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  )
}
