export const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const

export type NodeId = (typeof SECTIONS)[number]["id"]
export type ViewMode = "orbital" | "scroll"
