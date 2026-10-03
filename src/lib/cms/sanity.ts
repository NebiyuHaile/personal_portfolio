"use client"

import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"
import { resumeSchema, type NormalizedData } from "@/src/content/schema"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const client = projectId
  ? createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      useCdn: true,
      apiVersion: "2024-01-01",
      token: process.env.SANITY_API_TOKEN,
    })
  : null

const builder = client ? imageUrlBuilder(client) : null

export function urlFor(source: any) {
  if (!builder) {
    console.warn("[v0] Sanity not configured, cannot generate image URL")
    return { url: () => "" }
  }
  return builder.image(source)
}

export async function fetchFromSanity(): Promise<NormalizedData | null> {
  try {
    if (!client || !projectId) {
      console.log("[v0] Sanity not configured, skipping")
      return null
    }

    const query = `
      *[_type == "portfolio"][0] {
        summary {
          headline,
          about,
          links {
            email,
            phone,
            linkedin,
            github
          }
        },
        experience[] {
          company,
          role,
          period,
          location,
          bullets,
          links
        },
        projects[] {
          name,
          summary,
          period,
          tech,
          bullets,
          links,
          image,
          caseStudy
        },
        skills {
          groups[] {
            title,
            items
          }
        },
        education,
        activities,
        contact {
          email,
          phone,
          socials
        }
      }
    `

    const data = await client.fetch(query)

    if (!data) {
      console.log("[v0] No portfolio data found in Sanity")
      return null
    }

    console.log("[v0] Successfully loaded data from Sanity")
    return normalizeSanityData(data)
  } catch (error) {
    console.warn("[v0] Failed to fetch from Sanity:", error)
    return null
  }
}

function normalizeSanityData(data: any): NormalizedData {
  return resumeSchema.parse({
    education: data.education,
    activities: data.activities,
    summary: {
      headline: data.summary?.headline || "Portfolio",
      about: data.summary?.about || "",
      links: data.summary?.links || { email: "" },
    },
    experience:
      data.experience?.map((exp: any) => ({
        company: exp.company || "",
        role: exp.role || "",
        period: exp.period || "",
        location: exp.location || "",
        bullets: exp.bullets || [],
        links: exp.links || {},
      })) || [],
    projects:
      data.projects?.map((project: any) => ({
        caseStudy: project.caseStudy,
        name: project.name || "",
        summary: project.summary || "",
        period: project.period || "",
        tech: project.tech || [],
        bullets: project.bullets || [],
        links: project.links || {},
        image: project.image ? urlFor(project.image).url() : undefined,
      })) || [],
    skills: {
      groups:
        data.skills?.groups?.map((group: any) => ({
          title: group.title || "",
          items: group.items || [],
        })) || [],
    },
    contact: {
      email: data.contact?.email || "",
      phone: data.contact?.phone || "",
      socials: data.contact?.socials || {},
    },
  })
}
