"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { announceToScreenReader } from "@/src/lib/accessibility"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] ErrorBoundary caught an error:", error, errorInfo)
    announceToScreenReader("An error occurred in the 3D scene. Switching to accessible view.", "assertive")
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-400">3D Scene Error</h2>
              <p className="text-white/70">
                The 3D orbital view encountered an error. You can still access all content in the accessible list view.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Reload Page
              </button>

              <button
                onClick={() => {
                  // Switch to list view
                  const event = new CustomEvent("switchToListView")
                  window.dispatchEvent(event)
                }}
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Switch to List View
              </button>
            </div>

            <div className="text-xs text-white/50">
              <p>This error has been logged for investigation.</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
