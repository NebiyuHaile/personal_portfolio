"use client"

import { useEffect } from "react"
import { announceToScreenReader } from "@/src/lib/accessibility"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Application error:", error)
    announceToScreenReader("An error occurred while loading the portfolio", "assertive")
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
          <p className="text-white/70">
            We encountered an unexpected error while loading the portfolio. This might be a temporary issue.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Reload Page
          </button>
        </div>

        <div className="text-xs text-white/50">
          <p>Error ID: {error.digest}</p>
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  )
}
