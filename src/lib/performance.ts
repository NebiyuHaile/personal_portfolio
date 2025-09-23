"use client"

import { useEffect, useRef, useState } from "react"

export interface PerformanceMetrics {
  fps: number
  memory: number
  drawCalls: number
  triangles: number
  quality: "high" | "medium" | "low"
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    quality: "high",
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])

  useEffect(() => {
    let animationId: number

    const updateMetrics = () => {
      const now = performance.now()
      const delta = now - lastTime.current

      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta)
        fpsHistory.current.push(fps)

        // Keep only last 10 fps readings
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift()
        }

        const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length

        // Get memory usage if available
        const memory = (performance as any).memory?.usedJSHeapSize || 0

        // Determine quality based on performance
        let quality: "high" | "medium" | "low" = "high"
        if (avgFps < 30) quality = "low"
        else if (avgFps < 45) quality = "medium"

        setMetrics((prev) => ({
          ...prev,
          fps: Math.round(avgFps),
          memory: Math.round(memory / 1024 / 1024), // MB
          quality,
        }))

        frameCount.current = 0
        lastTime.current = now
      }

      frameCount.current++
      animationId = requestAnimationFrame(updateMetrics)
    }

    updateMetrics()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return metrics
}

export function getOptimalSettings(quality: "high" | "medium" | "low") {
  switch (quality) {
    case "high":
      return {
        dpr: [1, 2],
        antialias: true,
        shadows: true,
        postprocessing: true,
        particleCount: 5000,
        nodeSegments: 32,
        sunSegments: 32,
      }
    case "medium":
      return {
        dpr: [1, 1.5],
        antialias: true,
        shadows: false,
        postprocessing: false,
        particleCount: 2500,
        nodeSegments: 16,
        sunSegments: 16,
      }
    case "low":
      return {
        dpr: [1, 1],
        antialias: false,
        shadows: false,
        postprocessing: false,
        particleCount: 1000,
        nodeSegments: 8,
        sunSegments: 8,
      }
  }
}

export class MemoryManager {
  private static instance: MemoryManager
  private disposables: Set<any> = new Set()
  private textures: Map<string, any> = new Map()

  static getInstance() {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  addDisposable(object: any) {
    this.disposables.add(object)
  }

  cacheTexture(key: string, texture: any) {
    this.textures.set(key, texture)
  }

  getTexture(key: string) {
    return this.textures.get(key)
  }

  dispose() {
    console.log("[v0] Disposing", this.disposables.size, "objects")

    this.disposables.forEach((object) => {
      if (object.dispose) {
        object.dispose()
      }
    })

    this.textures.forEach((texture) => {
      if (texture.dispose) {
        texture.dispose()
      }
    })

    this.disposables.clear()
    this.textures.clear()
  }

  getMemoryUsage() {
    return {
      disposables: this.disposables.size,
      textures: this.textures.size,
    }
  }
}
