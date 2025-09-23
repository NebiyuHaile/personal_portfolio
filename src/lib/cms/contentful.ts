"use client"

import type { NormalizedData } from "@/src/content/loader"

export async function fetchFromContentful(): Promise<NormalizedData | null> {
  try {
    if (!process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID) {
      console.log("[v0] Contentful not configured, skipping")
      return null
    }

    const response = await fetch("/api/content")

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[v0] No portfolio data found in Contentful")
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully loaded data from Contentful")
    return data
  } catch (error) {
    console.warn("[v0] Failed to fetch from Contentful:", error)
    return null
  }
}
