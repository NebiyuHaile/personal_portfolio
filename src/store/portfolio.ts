"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Vector3 } from "three"
import type { NormalizedData } from "@/src/content/loader"

interface PortfolioState {
  // Data
  resumeData: NormalizedData | null
  setResumeData: (data: NormalizedData) => void
  dataSource: "sanity" | "contentful" | "json" | "demo" | null
  setDataSource: (source: "sanity" | "contentful" | "json" | "demo") => void

  // Navigation
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  hoveredIndex: number | null
  setHoveredIndex: (index: number | null) => void

  // UI State
  isPanelOpen: boolean
  setIsPanelOpen: (open: boolean) => void
  useListView: boolean
  setUseListView: (use: boolean) => void

  // Accessibility
  reducedMotion: boolean
  setReducedMotion: (reduced: boolean) => void

  // 3D Scene
  nodePositions: Vector3[]
  setNodePositions: (positions: Vector3[]) => void

  // Performance
  performanceMode: "high" | "medium" | "low"
  setPerformanceMode: (mode: "high" | "medium" | "low") => void

  // Actions
  navigateToNode: (direction: "next" | "prev") => void
  focusNode: (index: number) => void
  closePanel: () => void
  refreshData: () => Promise<void>
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Data
      resumeData: null,
      setResumeData: (data) => set({ resumeData: data }),
      dataSource: null,
      setDataSource: (source) => set({ dataSource: source }),

      // Navigation
      focusedIndex: -1,
      setFocusedIndex: (index) => set({ focusedIndex: index }),
      hoveredIndex: null,
      setHoveredIndex: (index) => set({ hoveredIndex: index }),

      // UI State
      isPanelOpen: false,
      setIsPanelOpen: (open) => set({ isPanelOpen: open }),
      useListView: false,
      setUseListView: (use) => set({ useListView: use }),

      // Accessibility
      reducedMotion: false,
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

      // 3D Scene
      nodePositions: [],
      setNodePositions: (positions) => set({ nodePositions: positions }),

      // Performance
      performanceMode: "high",
      setPerformanceMode: (mode) => set({ performanceMode: mode }),

      // Actions
      navigateToNode: (direction) => {
        const { focusedIndex } = get()
        const nodeCount = 5
        let newIndex: number

        if (focusedIndex === -1) {
          newIndex = direction === "next" ? 0 : nodeCount - 1
        } else {
          newIndex = direction === "next" ? (focusedIndex + 1) % nodeCount : (focusedIndex - 1 + nodeCount) % nodeCount
        }

        get().focusNode(newIndex)
      },

      focusNode: (index) => {
        set({
          focusedIndex: index,
          isPanelOpen: true,
        })
      },

      closePanel: () => {
        set({
          focusedIndex: -1,
          isPanelOpen: false,
        })
      },

      refreshData: async () => {
        const { loadResumeData } = await import("@/src/content/loader")
        const data = await loadResumeData()
        set({ resumeData: data })
      },
    }),
    {
      name: "orbital-portfolio-storage",
      partialize: (state) => ({
        useListView: state.useListView,
        reducedMotion: state.reducedMotion,
        performanceMode: state.performanceMode,
      }),
    },
  ),
)
