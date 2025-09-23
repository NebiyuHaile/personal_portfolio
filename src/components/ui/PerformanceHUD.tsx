"use client"

import { useState } from "react"
import { usePerformanceMonitor, MemoryManager } from "@/src/lib/performance"
import { usePortfolioStore } from "@/src/store/portfolio"

export function PerformanceHUD() {
  const [isVisible, setIsVisible] = useState(false)
  const metrics = usePerformanceMonitor()
  const { performanceMode, setPerformanceMode } = usePortfolioStore()
  const memoryUsage = MemoryManager.getInstance().getMemoryUsage()

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 w-8 h-8 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-xs"
        title="Show Performance Stats"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg border border-white/20 text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Performance</span>
        <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white">
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? "text-red-400" : metrics.fps < 45 ? "text-yellow-400" : "text-green-400"}>
            {metrics.fps}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Memory:</span>
          <span>{metrics.memory}MB</span>
        </div>

        <div className="flex justify-between">
          <span>Quality:</span>
          <span className="capitalize">{metrics.quality}</span>
        </div>

        <div className="flex justify-between">
          <span>Objects:</span>
          <span>{memoryUsage.disposables}</span>
        </div>

        <div className="flex justify-between">
          <span>Textures:</span>
          <span>{memoryUsage.textures}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/20">
        <div className="text-xs text-white/60 mb-2">Force Quality:</div>
        <div className="flex gap-1">
          {(["high", "medium", "low"] as const).map((quality) => (
            <button
              key={quality}
              onClick={() => setPerformanceMode(quality)}
              className={`px-2 py-1 rounded text-xs capitalize ${
                performanceMode === quality ? "bg-white/20 text-white" : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
