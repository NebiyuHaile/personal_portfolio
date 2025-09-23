"use client"

import { useEffect, useRef } from "react"
import type { PanelData } from "@/src/content/map"
import { animatePanel } from "@/src/lib/motionConfig"
import { trapFocus, announceToScreenReader } from "@/src/lib/accessibility"

interface PanelProps {
  data: PanelData
  isOpen: boolean
  onClose: () => void
}

export function Panel({ data, isOpen, onClose }: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<any>(null)

  useEffect(() => {
    if (!panelRef.current) return

    // Kill any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    if (isOpen) {
      announceToScreenReader(`${data.title} panel opened`)

      timelineRef.current = animatePanel(panelRef.current, true, () => {
        console.log("[v0] Panel animation completed")
      })

      const cleanupFocusTrap = trapFocus(panelRef.current)
      return cleanupFocusTrap
    } else {
      announceToScreenReader(`${data.title} panel closed`)

      timelineRef.current = animatePanel(panelRef.current, false)
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [isOpen, data.title])

  const renderContent = () => {
    switch (data.title) {
      case "Introduction":
        return <IntroductionPanel content={data.content} />
      case "Experience":
        return <ExperiencePanel content={data.content} />
      case "Projects":
        return <ProjectsPanel content={data.content} />
      case "Skills":
        return <SkillsPanel content={data.content} />
      case "Contact":
        return <ContactPanel content={data.content} />
      default:
        return <div>Content not found</div>
    }
  }

  return (
    <div
      className={`panel-overlay ${isOpen ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div ref={panelRef} className="p-8 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 id="panel-title" className="text-3xl font-bold text-white text-balance" data-animate>
            {data.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label={`Close ${data.title} panel`}
            data-animate
          >
            ×
          </button>
        </div>
        <div className="text-white/90">{renderContent()}</div>
      </div>
    </div>
  )
}

function IntroductionPanel({ content }: { content: any }) {
  return (
    <div className="space-y-8">
      <div data-animate>
        <h3 className="text-2xl font-semibold text-blue-300 mb-4 text-balance">{content.headline}</h3>
      </div>

      <div data-animate>
        <p className="text-lg leading-relaxed text-pretty">{content.about}</p>
      </div>

      <div data-animate>
        <div className="flex flex-wrap gap-4">
          {content.links.email && (
            <a
              href={`mailto:${content.links.email}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <span>📧</span>
              <span>Email</span>
            </a>
          )}
          {content.links.linkedin && (
            <a
              href={content.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              <span>💼</span>
              <span>LinkedIn</span>
            </a>
          )}
          {content.links.github && (
            <a
              href={content.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 rounded-lg hover:bg-gray-600/30 transition-colors"
            >
              <span>🔗</span>
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ExperiencePanel({ content }: { content: any }) {
  return (
    <div className="space-y-8">
      {content.items.map((item: any, index: number) => (
        <div key={index} data-animate>
          <div className="border-l-2 border-blue-400/30 pl-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <h3 className="text-xl font-semibold text-blue-300 text-balance">{item.role}</h3>
              <span className="text-sm text-white/60 mt-1 md:mt-0">{item.period}</span>
            </div>

            <p className="text-lg text-white/80 mb-2">{item.company}</p>

            {item.location && <p className="text-sm text-white/60 mb-4">{item.location}</p>}

            <ul className="space-y-2">
              {item.bullets.map((bullet: string, bulletIndex: number) => (
                <li key={bulletIndex} className="flex items-start gap-3">
                  <span className="text-blue-400 mt-2 text-xs">●</span>
                  <span className="text-white/90 leading-relaxed text-pretty">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsPanel({ content }: { content: any }) {
  return (
    <div className="grid gap-6">
      {content.items.map((project: any, index: number) => (
        <div key={index} data-animate>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-300 text-balance">{project.name}</h3>
              {project.period && <span className="text-sm text-white/60 mt-1 md:mt-0">{project.period}</span>}
            </div>

            <p className="text-white/90 mb-4 leading-relaxed text-pretty">{project.summary}</p>

            {project.bullets && project.bullets.length > 0 && (
              <ul className="space-y-2 mb-4">
                {project.bullets.map((bullet: string, bulletIndex: number) => (
                  <li key={bulletIndex} className="flex items-start gap-3">
                    <span className="text-green-400 mt-2 text-xs">●</span>
                    <span className="text-white/80 leading-relaxed text-pretty">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech: string, techIndex: number) => (
                <span key={techIndex} className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkillsPanel({ content }: { content: any }) {
  return (
    <div className="grid gap-8">
      {content.groups.map((group: any, index: number) => (
        <div key={index} data-animate>
          <h3 className="text-xl font-semibold text-orange-300 mb-4 text-balance">{group.title}</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.items.map((skill: string, skillIndex: number) => (
              <div
                key={skillIndex}
                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors text-center"
              >
                <span className="text-white/90 text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactPanel({ content }: { content: any }) {
  return (
    <div className="space-y-8">
      <div data-animate>
        <h3 className="text-2xl font-semibold text-purple-300 mb-6 text-balance">Let's Connect</h3>
      </div>

      <div data-animate>
        <div className="space-y-4">
          {content.email && (
            <a
              href={`mailto:${content.email}`}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <span className="text-xl">📧</span>
              </div>
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-white/70 text-sm">{content.email}</p>
              </div>
            </a>
          )}

          {content.phone && (
            <a
              href={`tel:${content.phone}`}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <span className="text-xl">📱</span>
              </div>
              <div>
                <p className="text-white font-medium">Phone</p>
                <p className="text-white/70 text-sm">{content.phone}</p>
              </div>
            </a>
          )}
        </div>
      </div>

      <div data-animate>
        <h4 className="text-lg font-medium text-white/90 mb-4">Social Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(content.socials).map(([platform, url]) => (
            <a
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <span className="text-lg">{platform === "linkedin" ? "💼" : platform === "github" ? "🔗" : "🌐"}</span>
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
  )
}
