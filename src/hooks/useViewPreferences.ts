"use client"

import { useEffect, useState } from "react"
import { usePortfolioStore } from "@/src/store/portfolio"
import { shouldUseScrollView } from "@/src/lib/viewPreferences"

type DeviceNavigator = Navigator & {
  deviceMemory?: number
  connection?: EventTarget & { saveData?: boolean }
}

export function useViewPreferences() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let disposed = false
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const mobile = window.matchMedia("(max-width: 820px) and (pointer: coarse)")
    const device = navigator as DeviceNavigator
    let webgl = false
    try {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl")
      webgl = Boolean(context)
      context?.getExtension("WEBGL_lose_context")?.loseContext()
    } catch { /* Scroll view remains available. */ }
    const apply = () => {
      const state = usePortfolioStore.getState()
      state.setReducedMotion(motion.matches)
      if (shouldUseScrollView({ reducedMotion: motion.matches, mobile: mobile.matches,
        memory: device.deviceMemory, cores: device.hardwareConcurrency,
        saveData: device.connection?.saveData, webgl })) state.setViewMode("scroll")
    }
    const initialize = async () => {
      await usePortfolioStore.persist.rehydrate()
      if (disposed) return
      apply()
      setReady(true)
    }
    void initialize()
    motion.addEventListener("change", apply)
    mobile.addEventListener("change", apply)
    device.connection?.addEventListener("change", apply)
    return () => {
      disposed = true
      motion.removeEventListener("change", apply)
      mobile.removeEventListener("change", apply)
      device.connection?.removeEventListener("change", apply)
    }
  }, [])
  return ready
}
