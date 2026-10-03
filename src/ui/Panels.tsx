"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion, useIsPresent } from "framer-motion"
import { usePortfolioStore } from "@/src/store/portfolio"
import { SECTIONS, type NodeId } from "@/src/content/sections"
import type { NormalizedData } from "@/src/content/schema"
import { SectionContent } from "./SectionContent"

function GlassPanel({ id, data, reducedMotion }: { id: NodeId; data: NormalizedData; reducedMotion: boolean }) {
  const label = SECTIONS.find((section) => section.id === id)!.label
  const closePanel = usePortfolioStore((state) => state.closePanel)
  const isPresent = useIsPresent()
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      const state = usePortfolioStore.getState()
      if (state.activeNode === null && state.viewMode === "orbital") {
        const navigation = document.querySelector<HTMLButtonElement>(`#navigation [data-node="${id}"]`)
        ;(navigation ?? previous)?.focus({ preventScroll: true })
      }
    }
  }, [id])

  return <motion.aside
    ref={panelRef}
    role="dialog"
    aria-labelledby={`panel-${id}-title`}
    aria-hidden={!isPresent}
    inert={!isPresent}
    className={`glass-panel ${id === "projects" ? "glass-panel-projects" : ""}`}
    initial={reducedMotion ? false : { opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
    transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}
    onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); closePanel() } }}
  >
    <header className="glass-panel-header"><div><p className="eyebrow">Orbital observatory</p><h2 id={`panel-${id}-title`}>{label}</h2></div>
      <button ref={closeRef} onClick={closePanel} className="panel-close" aria-label={`Close ${label} panel`}>×</button>
    </header>
    <motion.div className="glass-panel-content" initial={reducedMotion ? false : "hidden"} animate="visible"
      variants={{ visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.07 } } }}>
      <SectionContent id={id} data={data} />
    </motion.div>
  </motion.aside>
}

export function Panel() {
  const activeNode = usePortfolioStore((state) => state.activeNode)
  const resumeData = usePortfolioStore((state) => state.resumeData)
  const viewMode = usePortfolioStore((state) => state.viewMode)
  const reducedMotion = usePortfolioStore((state) => state.reducedMotion)
  return <AnimatePresence mode="wait">
    {activeNode && resumeData && viewMode === "orbital" && <GlassPanel key={activeNode} id={activeNode} data={resumeData} reducedMotion={reducedMotion} />}
  </AnimatePresence>
}
