import bundledResume from "@/public/resume.json"
import { fetchFromSanity } from "@/src/lib/cms/sanity"
import { fetchFromContentful } from "@/src/lib/cms/contentful"

import { resumeSchema, type NormalizedData } from "./schema"
export type { NormalizedData } from "./schema"

export async function loadResumeData(): Promise<NormalizedData> {
  console.log("[v0] Starting content loading sequence")

  try {
    // Try Sanity first
    const sanityData = await fetchFromSanity()
    if (sanityData) {
      console.log("[v0] Using Sanity CMS data")
      return resumeSchema.parse(sanityData)
    }
  } catch (error) {
    console.log("[v0] Failed to fetch from Sanity:", error)
  }

  try {
    // Try Contentful second
    const contentfulData = await fetchFromContentful()
    if (contentfulData) {
      console.log("[v0] Using Contentful CMS data")
      return resumeSchema.parse(contentfulData)
    }
  } catch (error) {
    console.log("[v0] No portfolio data found in Contentful")
  }

  try {
    // Try JSON third
    const response = await fetch("/resume.json")
    if (response.ok) {
      const data = await response.json()
      console.log("[v0] Using resume.json fallback")
      return normalizeData(data)
    }
  } catch (error) {
    console.log("[v0] JSON loading failed:", error)
  }

  console.log("[v0] Using bundled resume fallback")
  return getBundledData()
}

export function normalizeData(data: unknown): NormalizedData {
  return resumeSchema.parse(data)
}

export function getBundledData(): NormalizedData {
  return resumeSchema.parse(bundledResume)
}
