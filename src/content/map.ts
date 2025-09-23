// Content mapping for panels
import type { NormalizedData } from "./loader"

export interface PanelData {
  title: string
  content: any
}

export function mapContentToPanels(data: NormalizedData): Record<string, PanelData> {
  return {
    introduction: {
      title: "Introduction",
      content: {
        headline: data.summary.headline,
        about: data.summary.about,
        links: data.summary.links,
      },
    },
    experience: {
      title: "Experience",
      content: {
        items: data.experience,
      },
    },
    projects: {
      title: "Projects",
      content: {
        items: data.projects,
      },
    },
    skills: {
      title: "Skills",
      content: {
        groups: data.skills.groups,
      },
    },
    contact: {
      title: "Contact",
      content: {
        email: data.contact.email,
        phone: data.contact.phone,
        socials: data.contact.socials,
      },
    },
  }
}
