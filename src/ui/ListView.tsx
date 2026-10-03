"use client"

import type { NormalizedData } from "@/src/content/schema"
import { SectionContent } from "./SectionContent"

export function ListView({ data }: { data: NormalizedData }) {
  return <div className="scroll-portfolio">
    <header className="scroll-intro" aria-labelledby="introduction-heading">
      <p className="eyebrow">Nebiyu Haile · Engineering & research</p>
      <h1 id="introduction-heading">{data.summary.headline}</h1>
      <SectionContent id="introduction" data={data} showHeadline={false} />
      <a className="explore-projects" href="#projects-heading">Explore selected work <span aria-hidden="true">↓</span></a>
    </header>
    <section aria-labelledby="projects-heading" className="scroll-section"><div className="section-heading"><p className="eyebrow">01 / Selected work</p><h2 id="projects-heading">Ideas, built into systems.</h2><p>Projects, architecture, and the decisions behind the implementation.</p></div><SectionContent id="projects" data={data} /></section>
    <section aria-labelledby="experience-heading" className="scroll-section"><div className="section-heading"><p className="eyebrow">02 / Experience</p><h2 id="experience-heading">Where I’ve contributed.</h2></div><SectionContent id="experience" data={data} /></section>
    <section aria-labelledby="skills-heading" className="scroll-section"><div className="section-heading"><p className="eyebrow">03 / Toolkit</p><h2 id="skills-heading">Skills & technologies.</h2></div><SectionContent id="skills" data={data} /></section>
    <section aria-labelledby="contact-heading" className="scroll-section"><div className="section-heading"><p className="eyebrow">04 / Contact</p><h2 id="contact-heading">Start a conversation.</h2></div><SectionContent id="contact" data={data} /></section>
    <footer className="scroll-footer">Nebiyu Haile · Built with curiosity.</footer>
  </div>
}
