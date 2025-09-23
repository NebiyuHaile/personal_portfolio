import { fetchFromSanity } from "@/src/lib/cms/sanity"
import { fetchFromContentful } from "@/src/lib/cms/contentful"

export interface NormalizedData {
  summary: {
    headline: string
    about: string
    links: {
      email: string
      phone?: string
      linkedin?: string
      github?: string
    }
  }
  experience: Array<{
    company: string
    role: string
    period: string
    location?: string
    bullets: string[]
    links: Record<string, string>
  }>
  projects: Array<{
    name: string
    summary: string
    period?: string
    tech: string[]
    bullets?: string[]
    links: Record<string, string>
    image?: string
  }>
  skills: {
    groups: Array<{
      title: string
      items: string[]
    }>
  }
  contact: {
    email: string
    phone?: string
    socials: Record<string, string>
  }
}

export async function loadResumeData(): Promise<NormalizedData> {
  console.log("[v0] Starting content loading sequence")

  try {
    // Try Sanity first
    const sanityData = await fetchFromSanity()
    if (sanityData) {
      console.log("[v0] Using Sanity CMS data")
      return sanityData
    }
  } catch (error) {
    console.log("[v0] Failed to fetch from Sanity:", error)
  }

  try {
    // Try Contentful second
    const contentfulData = await fetchFromContentful()
    if (contentfulData) {
      console.log("[v0] Using Contentful CMS data")
      return contentfulData
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

  console.log("[v0] Using demo fallback data")
  return getDemoData()
}

function normalizeData(data: any): NormalizedData {
  return {
    summary: {
      headline: data.summary?.headline || "Portfolio",
      about: data.summary?.about || "",
      links: data.summary?.links || { email: "" },
    },
    experience: data.experience || [],
    projects: data.projects || [],
    skills: data.skills || { groups: [] },
    contact: data.contact || { email: "", socials: {} },
  }
}

export function getDemoData(): NormalizedData {
  return {
    summary: {
      headline: "Creative Developer & Designer",
      about:
        "Passionate about creating immersive digital experiences that blend cutting-edge technology with thoughtful design. Specializing in 3D web development, interactive animations, and modern frontend architectures.",
      links: {
        email: "hello@example.com",
        linkedin: "https://linkedin.com/in/example",
        github: "https://github.com/example",
      },
    },
    experience: [
      {
        company: "Tech Innovations Inc.",
        role: "Senior Frontend Developer",
        period: "2022 - Present",
        location: "San Francisco, CA",
        bullets: [
          "Led development of interactive 3D web experiences using Three.js and React Three Fiber",
          "Implemented advanced animation systems with GSAP for award-winning client projects",
          "Optimized performance for complex 3D scenes, achieving 60fps on mobile devices",
          "Mentored junior developers and established best practices for 3D web development",
        ],
        links: {},
      },
      {
        company: "Digital Creative Studio",
        role: "Frontend Developer",
        period: "2020 - 2022",
        location: "Remote",
        bullets: [
          "Built responsive web applications using React, Next.js, and modern CSS frameworks",
          "Collaborated with designers to create pixel-perfect implementations of complex UI designs",
          "Integrated headless CMS solutions for content management and dynamic site generation",
        ],
        links: {},
      },
    ],
    projects: [
      {
        name: "Orbital Portfolio System",
        summary:
          "An innovative 3D portfolio experience featuring orbital navigation, smooth camera transitions, and immersive interactions built with React Three Fiber.",
        period: "2024",
        tech: ["React Three Fiber", "GSAP", "Next.js", "TypeScript", "Tailwind CSS"],
        bullets: [
          "Implemented precise motion timing with 0.9-1.1s camera tweens and 280-360ms panel animations",
          "Created accessible fallback with list view for users with reduced motion preferences",
          "Integrated CMS support with Sanity and Contentful for dynamic content management",
        ],
        links: {},
      },
      {
        name: "Interactive Data Visualization",
        summary:
          "Real-time 3D data visualization platform for complex datasets with WebGL rendering and smooth animations.",
        period: "2023",
        tech: ["Three.js", "D3.js", "WebGL", "React", "Node.js"],
        bullets: [
          "Processed and visualized datasets with 100k+ data points in real-time",
          "Implemented custom shaders for enhanced visual effects and performance",
        ],
        links: {},
      },
    ],
    skills: {
      groups: [
        {
          title: "Frontend Development",
          items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3"],
        },
        {
          title: "3D & Animation",
          items: ["Three.js", "React Three Fiber", "GSAP", "WebGL", "Blender", "Cinema 4D"],
        },
        {
          title: "Tools & Platforms",
          items: ["Git", "Figma", "Adobe Creative Suite", "Vercel", "AWS", "Docker"],
        },
      ],
    },
    contact: {
      email: "hello@example.com",
      phone: "+1 (555) 123-4567",
      socials: {
        linkedin: "https://linkedin.com/in/example",
        github: "https://github.com/example",
        twitter: "https://twitter.com/example",
      },
    },
  }
}
