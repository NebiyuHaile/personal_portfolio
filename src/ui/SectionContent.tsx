"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import type { ArchitectureLayer, NormalizedData, Project } from "@/src/content/schema"
import type { NodeId } from "@/src/content/sections"

function Block({ children }: { children: ReactNode }) {
  return <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.22 }} className="content-block">{children}</motion.div>
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return null
  return <ul className="content-bullets">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
}

function Tags({ items }: { items: string[] }) {
  return <ul className="tech-tags" aria-label="Technologies">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
}

const LINK_LABELS: Record<string, string> = { linkedin: "LinkedIn", github: "GitHub", demo: "Live demo", source: "Source code" }

function Links({ links }: { links: Record<string, string | undefined> }) {
  return <div className="content-links">{Object.entries(links).filter(([, value]) => Boolean(value)).map(([label, value]) => {
    const href = label === "email" ? `mailto:${value}` : label === "phone" ? `tel:${value?.replace(/[^\d+]/g, "")}` : value
    const external = label !== "email" && label !== "phone"
    return <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {label === "email" || label === "phone" ? value : LINK_LABELS[label] ?? label.replace(/[-_]/g, " ")}
      {external && <span aria-hidden="true"> ↗</span>}
    </a>
  })}</div>
}

function Layer({ title, layer }: { title: string; layer?: ArchitectureLayer }) {
  if (!layer) return null
  return <section className="architecture-layer" aria-label={title}>
    <h5>{title}</h5><p>{layer.summary}</p><Tags items={layer.tech} /><Bullets items={layer.details} />
  </section>
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const story = project.caseStudy
  return <article className="project-card" aria-label={project.name}>
    <div className="project-meta"><span>PROJECT {String(index + 1).padStart(2, "0")}</span>{project.period && <span>{project.period}</span>}</div>
    <h3>{project.name}</h3><p className="project-summary">{project.summary}</p>
    {project.image && <img className="project-image" src={project.image} alt={`${project.name} preview`} loading="lazy" width={960} height={540} />}
    <Tags items={project.tech} /><Bullets items={project.bullets ?? []} />
    {story && <details className="case-study" open>
      <summary>Explore the architecture <span aria-hidden="true">＋</span></summary>
      <div className="case-study-body">
        <h4 className="sr-only">Technical case study</h4>
        {story.problem && <section><h5>The problem</h5><p>{story.problem}</p></section>}
        {story.role && <section><h5>My contribution</h5><p>{story.role}</p></section>}
        <div className="architecture-grid">
          <Layer title="Frontend architecture" layer={story.frontend} />
          <Layer title="Backend & data" layer={story.backend} />
          <Layer title="Native & platform" layer={story.platform} />
        </div>
        {story.flow.length > 0 && <section><h5>Request & data flow</h5><ol className="data-flow">{story.flow.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>}
        {story.decisions.length > 0 && <section><h5>Engineering decisions</h5>{story.decisions.map((item, index) => <div className="design-decision" key={index}><h6>{item.title}</h6><p>{item.decision}</p>{item.tradeoff && <p><strong>Tradeoff: </strong>{item.tradeoff}</p>}</div>)}</section>}
        {story.outcomes.length > 0 && <section><h5>Outcomes</h5><Bullets items={story.outcomes} /></section>}
      </div>
    </details>}
    <Links links={project.links} />
  </article>
}

export function SectionContent({ id, data, showHeadline = true }: { id: NodeId; data: NormalizedData; showHeadline?: boolean }) {
  switch (id) {
    case "introduction": return <div className="section-content">
      <Block>{showHeadline && <h3>{data.summary.headline}</h3>}<p className="intro-copy">{data.summary.about}</p><Links links={data.summary.links} /></Block>
      {data.education && <Block><article className="education-card"><p className="eyebrow">Education</p><h3>{data.education.degree}</h3><p>{data.education.institution}</p><p className="muted">{data.education.period}{data.education.location && ` · ${data.education.location}`}</p><Tags items={data.education.coursework} /></article></Block>}
    </div>
    case "projects": return <div className="section-content">{data.projects.length ? data.projects.map((project, index) => <Block key={`${index}-${project.name}`}><ProjectCard project={project} index={index} /></Block>) : <p className="muted">Project details are coming soon.</p>}</div>
    case "experience": return <div className="section-content">{data.experience.map((item, index) => <Block key={`${index}-${item.company}`}><article className="experience-card"><p className="eyebrow">{item.period}</p><h3>{item.role}</h3><p>{item.company}</p>{item.location && <p className="muted">{item.location}</p>}<Bullets items={item.bullets} /><Links links={item.links} /></article></Block>)}</div>
    case "skills": return <div className="section-content skills-grid">{data.skills.groups.map((group, index) => <Block key={`${index}-${group.title}`}><article className="skill-card"><h3>{group.title}</h3><Tags items={group.items} /></article></Block>)}{data.activities?.length ? <Block><article className="skill-card"><h3>Professional development & activities</h3><ul className="activities-list">{data.activities.map((item, index) => <li key={index}><p>{item.name}</p>{item.period && <span className="muted">{item.period}</span>}</li>)}</ul></article></Block> : null}</div>
    case "contact": return <div className="section-content"><Block><h3>Let’s build something useful.</h3><p>Get in touch to talk about engineering, research, or a project.</p><Links links={{ email: data.contact.email, phone: data.contact.phone, ...data.contact.socials }} /></Block></div>
  }
}
