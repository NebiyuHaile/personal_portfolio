"use client"

import { SECTIONS } from "@/src/content/sections"
import { usePortfolioStore } from "@/src/store/portfolio"

export function Hud() {
  const activeNode = usePortfolioStore((state) => state.activeNode)
  const viewMode = usePortfolioStore((state) => state.viewMode)
  const selectNode = usePortfolioStore((state) => state.selectNode)
  const setViewMode = usePortfolioStore((state) => state.setViewMode)
  const isAnimating = usePortfolioStore((state) => state.isAnimating)

  const navigate = (node: typeof activeNode) => {
    selectNode(node)
    if (viewMode === "scroll") {
      const element = node ? document.getElementById(`${node}-heading`) : null
      if (element) element.scrollIntoView({ block: "start", behavior: "auto" })
      else window.scrollTo({ top: 0, behavior: "auto" })
    }
  }

  return (
    <nav id="navigation" aria-label="Portfolio navigation" className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/15 bg-slate-950/90 p-2 text-white shadow-xl backdrop-blur-md">
      <button onClick={() => navigate(null)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2">Overview</button>
      {SECTIONS.map((section) => (
        <button data-node={section.id} key={section.id} onClick={() => navigate(section.id)} aria-current={activeNode === section.id ? "location" : undefined}
          className={`rounded-lg px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2 ${activeNode === section.id ? "bg-white/15 text-sky-200" : "text-slate-300"}`}>
          {section.label}
        </button>
      ))}
      <button onClick={() => setViewMode(viewMode === "orbital" ? "scroll" : "orbital")} className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2">
        {viewMode === "orbital" ? "Scroll View" : "Orbital View"}
      </button>
      <span role="status" className="sr-only">{isAnimating ? `Camera moving to ${activeNode ?? "overview"}` : `${activeNode ?? "Overview"} ready`}</span>
    </nav>
  )
}
