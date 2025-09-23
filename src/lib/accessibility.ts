"use client"

import { useEffect, useState } from "react"

export function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function getHighContrastPreference(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-contrast: high)").matches
}

export function getColorSchemePreference(): "light" | "dark" | "no-preference" {
  if (typeof window === "undefined") return "no-preference"
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light"
  return "no-preference"
}

export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  if (typeof window === "undefined") return

  const announcement = document.createElement("div")
  announcement.setAttribute("aria-live", priority)
  announcement.setAttribute("aria-atomic", "true")
  announcement.className = "sr-only absolute -left-[10000px] w-[1px] h-[1px] overflow-hidden"
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement)
    }
  }, 1000)
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details, summary',
  )

  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return

    if (focusableElements.length === 1) {
      e.preventDefault()
      return
    }

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener("keydown", handleTabKey)
  firstFocusable?.focus()

  return () => {
    element.removeEventListener("keydown", handleTabKey)
  }
}

export function useKeyboardNavigation(callbacks: {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onSpace?: () => void
  onHome?: () => void
  onEnd?: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          callbacks.onArrowUp?.()
          break
        case "ArrowDown":
          event.preventDefault()
          callbacks.onArrowDown?.()
          break
        case "ArrowLeft":
          event.preventDefault()
          callbacks.onArrowLeft?.()
          break
        case "ArrowRight":
          event.preventDefault()
          callbacks.onArrowRight?.()
          break
        case "Enter":
          callbacks.onEnter?.()
          break
        case "Escape":
          callbacks.onEscape?.()
          break
        case " ":
          event.preventDefault()
          callbacks.onSpace?.()
          break
        case "Home":
          event.preventDefault()
          callbacks.onHome?.()
          break
        case "End":
          event.preventDefault()
          callbacks.onEnd?.()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [callbacks])
}

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    colorScheme: "no-preference" as "light" | "dark" | "no-preference",
  })

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: getReducedMotionPreference(),
        highContrast: getHighContrastPreference(),
        colorScheme: getColorSchemePreference(),
      })
    }

    updatePreferences()

    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-contrast: high)"),
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(prefers-color-scheme: light)"),
    ]

    mediaQueries.forEach((mq) => mq.addEventListener("change", updatePreferences))

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener("change", updatePreferences))
    }
  }, [])

  return preferences
}

export function checkColorContrast(
  foreground: string,
  background: string,
): {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
} {
  const getLuminance = (color: string) => {
    const rgb = Number.parseInt(color.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  }
}

export class AccessibilityTester {
  private static instance: AccessibilityTester
  private violations: Array<{ type: string; element: Element; message: string }> = []

  static getInstance() {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester()
    }
    return AccessibilityTester.instance
  }

  runTests() {
    this.violations = []
    this.checkImages()
    this.checkButtons()
    this.checkHeadings()
    this.checkFocusable()
    this.checkColorContrast()
    return this.violations
  }

  private checkImages() {
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute("aria-label") && !img.getAttribute("aria-labelledby")) {
        this.violations.push({
          type: "missing-alt",
          element: img,
          message: "Image missing alt text",
        })
      }
    })
  }

  private checkButtons() {
    const buttons = document.querySelectorAll("button")
    buttons.forEach((button) => {
      if (
        !button.textContent?.trim() &&
        !button.getAttribute("aria-label") &&
        !button.getAttribute("aria-labelledby")
      ) {
        this.violations.push({
          type: "missing-label",
          element: button,
          message: "Button missing accessible name",
        })
      }
    })
  }

  private checkHeadings() {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    let lastLevel = 0

    headings.forEach((heading) => {
      const level = Number.parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        this.violations.push({
          type: "heading-skip",
          element: heading,
          message: `Heading level skipped from h${lastLevel} to h${level}`,
        })
      }
      lastLevel = level
    })
  }

  private checkFocusable() {
    const focusable = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable.forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        this.violations.push({
          type: "small-target",
          element,
          message: "Interactive element smaller than 44x44px",
        })
      }
    })
  }

  private checkColorContrast() {
    // This would require more complex color analysis
    // For now, we'll just check if high contrast mode is needed
    if (getHighContrastPreference()) {
      console.log("[v0] High contrast mode preferred by user")
    }
  }

  getViolationCount() {
    return this.violations.length
  }

  getViolationsByType() {
    return this.violations.reduce(
      (acc, violation) => {
        acc[violation.type] = (acc[violation.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }
}
