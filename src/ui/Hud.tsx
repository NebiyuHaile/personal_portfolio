// HUD navigation component
"use client"

interface HudProps {
  focusedIndex: number
  hoveredIndex: number | null
  onNodeClick: (index: number) => void
}

const sections = ["Introduction", "Experience", "Projects", "Skills", "Contact"]

export function Hud({ focusedIndex, hoveredIndex, onNodeClick }: HudProps) {
  return (
    <nav className="hud-nav" aria-label="Portfolio navigation">
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
              focusedIndex === index
                ? "bg-white border-white shadow-lg shadow-white/50"
                : hoveredIndex === index
                  ? "bg-white/50 border-white scale-110"
                  : "bg-transparent border-white/50 hover:border-white/80 hover:scale-105"
            }`}
            onClick={() => onNodeClick(index)}
            aria-label={`${section} section`}
            title={section}
          />
        ))}
      </div>

      {/* Section labels on hover */}
      <div className="absolute right-6 top-0 pointer-events-none">
        {sections.map((section, index) => (
          <div
            key={section}
            className={`absolute transition-all duration-200 ${
              hoveredIndex === index || focusedIndex === index ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            }`}
            style={{
              top: `${index * 24}px`,
              transform: "translateY(-50%)",
            }}
          >
            <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-lg border border-white/20 whitespace-nowrap">
              {section}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
