import { NextResponse } from "next/server"
import { createClient } from "contentful"
import { resumeSchema, type NormalizedData } from "@/src/content/schema"

function normalizeContentfulData(data: any): NormalizedData {
  return resumeSchema.parse({
    education: data.education?.fields ?? data.education,
    activities: data.activities,
    summary: {
      headline: data.summary?.fields?.headline || "Portfolio",
      about: data.summary?.fields?.about || "",
      links: data.summary?.fields?.links || { email: "" },
    },
    experience:
      data.experience?.map((exp: any) => ({
        company: exp.fields?.company || "",
        role: exp.fields?.role || "",
        period: exp.fields?.period || "",
        location: exp.fields?.location || "",
        bullets: exp.fields?.bullets || [],
        links: exp.fields?.links || {},
      })) || [],
    projects:
      data.projects?.map((project: any) => ({
        caseStudy: project.fields?.caseStudy,
        name: project.fields?.name || "",
        summary: project.fields?.summary || "",
        period: project.fields?.period || "",
        tech: project.fields?.tech || [],
        bullets: project.fields?.bullets || [],
        links: project.fields?.links || {},
        image: project.fields?.image?.fields?.file?.url
          ? new URL(project.fields.image.fields.file.url, "https://images.ctfassets.net").href : undefined,
      })) || [],
    skills: {
      groups:
        data.skills?.fields?.groups?.map((group: any) => ({
          title: group.fields?.title || "",
          items: group.fields?.items || [],
        })) || [],
    },
    contact: {
      email: data.contact?.fields?.email || "",
      phone: data.contact?.fields?.phone || "",
      socials: data.contact?.fields?.socials || {},
    },
  })
}

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
      console.log("[v0] Contentful not configured")
      return NextResponse.json({ error: "Contentful not configured" }, { status: 404 })
    }

    const contentfulClient = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master",
    })
    const entries = await contentfulClient.getEntries({
      content_type: "portfolio",
      limit: 1,
    })

    if (!entries.items.length) {
      console.log("[v0] No portfolio entries found in Contentful")
      return NextResponse.json({ error: "No portfolio data found" }, { status: 404 })
    }

    const portfolio = entries.items[0].fields as any
    const normalizedData = normalizeContentfulData(portfolio)

    console.log("[v0] Successfully loaded data from Contentful via API")
    return NextResponse.json(normalizedData)
  } catch (error) {
    console.warn("[v0] Failed to fetch from Contentful:", error)
    return NextResponse.json({ error: "Failed to fetch from Contentful" }, { status: 500 })
  }
}
