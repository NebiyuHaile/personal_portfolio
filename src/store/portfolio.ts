"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Vector3 } from "three"
import { SECTIONS, type NodeId, type ViewMode } from "@/src/content/sections"
import type { NormalizedData } from "@/src/content/loader"

interface PortfolioState {
  // Data
  resumeData: NormalizedData | null
  setResumeData: (data: NormalizedData) => void
  dataSource: "sanity" | "contentful" | "json" | "demo" | null
  setDataSource: (source: "sanity" | "contentful" | "json" | "demo") => void

  activeNode: NodeId | null
  viewMode: ViewMode
  isAnimating: boolean
  transitionId: number
  selectNode: (node: NodeId | null) => void
  setViewMode: (mode: ViewMode) => void
  finishTransition: (id: number) => void

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

      activeNode: null,
      viewMode: "orbital",
      isAnimating: false,
      transitionId: 0,
      selectNode: (node) => set((state) => ({
        activeNode: node,
        focusedIndex: node === null ? -1 : SECTIONS.findIndex((section) => section.id === node),
        isPanelOpen: node !== null,
        isAnimating: state.viewMode === "orbital" && !state.reducedMotion,
        transitionId: state.transitionId + 1,
      })),
      setViewMode: (mode) => set((state) => ({
        viewMode: mode,
        useListView: mode === "scroll",
        isAnimating: mode === "orbital" && !state.reducedMotion,
        transitionId: state.transitionId + 1,
      })),
      finishTransition: (id) => set((state) =>
        id === state.transitionId ? { isAnimating: false } : {}),

      // Navigation
      focusedIndex: -1,
      setFocusedIndex: (index) => get().focusNode(index),
      hoveredIndex: null,
      setHoveredIndex: (index) => set({ hoveredIndex: index }),

      // UI State
      isPanelOpen: false,
      setIsPanelOpen: (open) => { if (!open) get().closePanel(); else if (get().activeNode) set({ isPanelOpen: true }) },
      useListView: false,
      setUseListView: (use) => get().setViewMode(use ? "scroll" : "orbital"),

      // Accessibility
      reducedMotion: false,
      setReducedMotion: (reduced) => set((state) => ({ reducedMotion: reduced, isAnimating: reduced ? false : state.isAnimating })),

      // 3D Scene
      nodePositions: [],
      setNodePositions: (positions) => set({ nodePositions: positions }),

      // Performance
      performanceMode: "high",
      setPerformanceMode: (mode) => set({ performanceMode: mode }),

      // Actions
      navigateToNode: (direction) => {
        const { focusedIndex } = get()
        const nodeCount = SECTIONS.length
        let newIndex: number

        if (focusedIndex === -1) {
          newIndex = direction === "next" ? 0 : nodeCount - 1
        } else {
          newIndex = direction === "next" ? (focusedIndex + 1) % nodeCount : (focusedIndex - 1 + nodeCount) % nodeCount
        }

        get().focusNode(newIndex)
      },

      focusNode: (index) => {
        if (index === -1) get().selectNode(null)
        else if (SECTIONS[index]) get().selectNode(SECTIONS[index].id)
      },

      closePanel: () => get().selectNode(null),

      refreshData: async () => {
        const { loadResumeData } = await import("@/src/content/loader")
        const data = await loadResumeData()
        set({ resumeData: data })
      },
    }),
    {
      name: "orbital-portfolio-storage",
      version: 1,
      skipHydration: true,
      migrate: () => ({ viewMode: "orbital", useListView: false }),
      partialize: (state) => ({
        viewMode: state.viewMode,
        useListView: state.viewMode === "scroll",
        performanceMode: state.performanceMode,
      }),
    },
  ),
)
