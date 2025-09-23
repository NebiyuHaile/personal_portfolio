"use client"

import Link from "next/link"
import { useEffect } from "react"
import { announceToScreenReader } from "@/src/lib/accessibility"

export default function NotFound() {
  useEffect(() => {
    announceToScreenReader("Page not found", "assertive")
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-blue-400">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-white/70">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Go Back
          </button>
        </div>

        <div className="text-xs text-white/50">
          <p>Lost? Try navigating back to the main portfolio.</p>
        </div>
      </div>
    </div>
  )
}
