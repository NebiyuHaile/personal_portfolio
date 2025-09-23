"use client"

import { useState, useEffect } from "react"
import { AccessibilityTester, useAccessibilityPreferences } from "@/src/lib/accessibility"
import { usePortfolioStore } from "@/src/store/portfolio"

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [violations, setViolations] = useState<any[]>([])
  const preferences = useAccessibilityPreferences()
  const { setReducedMotion, setUseListView } = usePortfolioStore()

  const runAccessibilityTest = () => {
    const tester = AccessibilityTester.getInstance()
    const results = tester.runTests()
    setViolations(results)
  }

  useEffect(() => {
    if (preferences.reducedMotion) {
      setReducedMotion(true)
      setUseListView(true)
    }
  }, [preferences.reducedMotion, setReducedMotion, setUseListView])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm border border-blue-600/30"
        aria-label="Open accessibility panel"
      >
        Accessibility Tools
      </button>
    )
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white p-6 rounded-lg border border-white/20 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Accessibility Tools</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/60 hover:text-white"
          aria-label="Close accessibility panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">User Preferences</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Reduced Motion:</span>
              <span className={preferences.reducedMotion ? "text-green-400" : "text-gray-400"}>
                {preferences.reducedMotion ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>High Contrast:</span>
              <span className={preferences.highContrast ? "text-green-400" : "text-gray-400"}>
                {preferences.highContrast ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Color Scheme:</span>
              <span className="capitalize">{preferences.colorScheme}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Accessibility Test</h3>
            <button
              onClick={runAccessibilityTest}
              className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors text-xs"
            >
              Run Test
            </button>
          </div>

          {violations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-red-400">{violations.length}</span> issues found
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {violations.map((violation, index) => (
                  <div key={index} className="text-xs p-2 bg-red-900/20 rounded border border-red-600/30">
                    <div className="font-medium text-red-300">{violation.type}</div>
                    <div className="text-red-200">{violation.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setUseListView(true)}
              className="w-full px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
            >
              Switch to List View
            </button>
            <button
              onClick={() => {
                document.body.style.filter = document.body.style.filter ? "" : "contrast(150%) brightness(120%)"
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
            >
              Toggle High Contrast
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
