"use client"

import type { NormalizedData } from "@/src/content/loader"
import { useKeyboardNavigation, announceToScreenReader } from "@/src/lib/accessibility"
import { useEffect, useRef } from "react"

interface ListViewProps {
  data: NormalizedData
}

export function ListView({ data }: ListViewProps) {
  const mainRef = useRef<HTMLElement>(null)

  useKeyboardNavigation({
    onArrowDown: () => {
      const focusable = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
      const current = document.activeElement
      const currentIndex = Array.from(focusable).indexOf(current as Element)
      const next = focusable[currentIndex + 1] as HTMLElement
      if (next) next.focus()
    },
    onArrowUp: () => {
      const focusable = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
      const current = document.activeElement
      const currentIndex = Array.from(focusable).indexOf(current as Element)
      const prev = focusable[currentIndex - 1] as HTMLElement
      if (prev) prev.focus()
    },
  })

  useEffect(() => {
    announceToScreenReader("Portfolio loaded in accessible list view")
  }, [])

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <h1
            className="text-4xl font-bold mb-4 text-balance focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            tabIndex={0}
          >
            {data.summary.headline}
          </h1>
          <p className="text-xl text-white/80 leading-relaxed text-pretty" role="doc-subtitle">
            {data.summary.about}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6" role="group" aria-label="Contact links">
            {data.summary.links.email && (
              <a
                href={`mailto:${data.summary.links.email}`}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Send email to ${data.summary.links.email}`}
              >
                Email
              </a>
            )}
            {data.summary.links.linkedin && (
              <a
                href={data.summary.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="View LinkedIn profile (opens in new tab)"
              >
                LinkedIn
              </a>
            )}
            {data.summary.links.github && (
              <a
                href={data.summary.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600/20 rounded-lg hover:bg-gray-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="View GitHub profile (opens in new tab)"
              >
                GitHub
              </a>
            )}
          </div>
        </header>

        <nav className="mb-12" aria-label="Portfolio sections">
          <h2 className="sr-only">Quick Navigation</h2>
          <ul className="flex flex-wrap justify-center gap-4">
            {[
              { id: "experience", label: "Work Experience" },
              { id: "projects", label: "Projects" },
              { id: "skills", label: "Skills" },
              { id: "contact", label: "Contact Information" },
            ].map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Jump to ${section.label} section`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main ref={mainRef} className="space-y-16">
          <section id="experience" aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="text-3xl font-bold mb-8 text-blue-300">
              Work Experience
            </h2>
            <div className="space-y-8">
              {data.experience.map((item, index) => (
                <article key={index} className="border-l-2 border-blue-400/30 pl-6" aria-labelledby={`exp-${index}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 id={`exp-${index}`} className="text-xl font-semibold text-blue-300">
                      {item.role}
                    </h3>
                    <time className="text-sm text-white/60" dateTime={item.period}>
                      {item.period}
                    </time>
                  </div>
                  <p className="text-lg text-white/80 mb-2">{item.company}</p>
                  {item.location && (
                    <p className="text-sm text-white/60 mb-4" aria-label={`Location: ${item.location}`}>
                      {item.location}
                    </p>
                  )}
                  <ul className="space-y-2" aria-label="Key responsibilities and achievements">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <span className="text-blue-400 mt-2 text-xs" aria-hidden="true">
                          ●
                        </span>
                        <span className="text-white/90 leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="projects" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="text-3xl font-bold mb-8 text-green-300">
              Projects
            </h2>
            <div className="grid gap-6">
              {data.projects.map((project, index) => (
                <article
                  key={index}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                  aria-labelledby={`project-${index}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 id={`project-${index}`} className="text-xl font-semibold text-green-300">
                      {project.name}
                    </h3>
                    {project.period && (
                      <time className="text-sm text-white/60" dateTime={project.period}>
                        {project.period}
                      </time>
                    )}
                  </div>
                  <p className="text-white/90 mb-4 leading-relaxed">{project.summary}</p>
                  {project.bullets && project.bullets.length > 0 && (
                    <ul className="space-y-2 mb-4" aria-label="Project details and achievements">
                      {project.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-3">
                          <span className="text-green-400 mt-2 text-xs" aria-hidden="true">
                            ●
                          </span>
                          <span className="text-white/80 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Technologies used">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm"
                        role="listitem"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="skills" aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="text-3xl font-bold mb-8 text-orange-300">
              Skills & Technologies
            </h2>
            <div className="grid gap-8">
              {data.skills.groups.map((group, index) => (
                <div key={index} aria-labelledby={`skill-group-${index}`}>
                  <h3 id={`skill-group-${index}`} className="text-xl font-semibold text-orange-300 mb-4">
                    {group.title}
                  </h3>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                    role="list"
                    aria-label={`${group.title} skills`}
                  >
                    {group.items.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 text-center"
                        role="listitem"
                      >
                        <span className="text-white/90 text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-3xl font-bold mb-8 text-purple-300">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="grid gap-4" role="group" aria-label="Direct contact methods">
                {data.contact.email && (
                  <a
                    href={`mailto:${data.contact.email}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={`Send email to ${data.contact.email}`}
                  >
                    <div
                      className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-white/70 text-sm">{data.contact.email}</p>
                    </div>
                  </a>
                )}
                {data.contact.phone && (
                  <a
                    href={`tel:${data.contact.phone}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={`Call ${data.contact.phone}`}
                  >
                    <div
                      className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Phone</p>
                      <p className="text-white/70 text-sm">{data.contact.phone}</p>
                    </div>
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-white/90 mb-4">Social Media & Professional Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Social media links">
                  {Object.entries(data.contact.socials).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                      aria-label={`View ${platform} profile (opens in new tab)`}
                    >
                      <div
                        className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="text-lg">
                          {platform === "linkedin" ? "💼" : platform === "github" ? "🔗" : "🌐"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{platform}</p>
                        <p className="text-white/70 text-sm">View Profile</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-white/20 text-center text-white/60">
          <p className="text-sm">
            This portfolio is designed with accessibility in mind. If you experience any issues, please{" "}
            <a
              href={`mailto:${data.contact.email}`}
              className="text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              contact me
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  )
}
