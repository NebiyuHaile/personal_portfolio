import { z } from "zod"

const link = z.string().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch { return false }
}, "Use an absolute HTTP or HTTPS URL")
const links = z.record(link).default({})
const layer = z.object({
  summary: z.string().min(1),
  tech: z.array(z.string()).default([]),
  details: z.array(z.string()).default([]),
})

export const caseStudySchema = z.object({
  problem: z.string().optional(),
  role: z.string().optional(),
  frontend: layer.optional(),
  backend: layer.optional(),
  platform: layer.optional(),
  flow: z.array(z.string()).default([]),
  decisions: z.array(z.object({
    title: z.string().min(1),
    decision: z.string().min(1),
    tradeoff: z.string().optional(),
  })).default([]),
  outcomes: z.array(z.string()).default([]),
})

export const projectSchema = z.object({
  name: z.string().min(1),
  summary: z.string(),
  period: z.string().optional(),
  tech: z.array(z.string()).default([]),
  bullets: z.array(z.string()).optional(),
  links,
  image: link.optional(),
  caseStudy: caseStudySchema.optional(),
})

export const resumeSchema = z.object({
  summary: z.object({
    headline: z.string().min(1),
    about: z.string(),
    links: z.object({
      email: z.union([z.string().email(), z.literal("")]),
      phone: z.string().optional(),
      linkedin: link.optional(),
      github: link.optional(),
    }),
  }),
  experience: z.array(z.object({
    company: z.string(), role: z.string(), period: z.string(),
    location: z.string().optional(), bullets: z.array(z.string()).default([]), links,
  })).default([]),
  projects: z.array(projectSchema).default([]),
  skills: z.object({ groups: z.array(z.object({ title: z.string(), items: z.array(z.string()) })) }),
  contact: z.object({
    email: z.union([z.string().email(), z.literal("")]),
    phone: z.string().optional(), socials: links,
  }),
  activities: z.array(z.object({ name: z.string(), period: z.string().optional() })).optional(),
  education: z.object({
    institution: z.string(), degree: z.string(), period: z.string(),
    location: z.string().optional(), coursework: z.array(z.string()).default([]),
  }).optional(),
})

export type NormalizedData = z.infer<typeof resumeSchema>
export type Project = z.infer<typeof projectSchema>
export type ArchitectureLayer = z.infer<typeof layer>
