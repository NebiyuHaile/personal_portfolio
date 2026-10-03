"use client"

import { createContext, useContext } from "react"
import type { Object3D } from "three"
import type { NodeId } from "@/src/content/sections"

export type SceneRegistry = Map<NodeId, Object3D>
export const SceneRegistryContext = createContext<SceneRegistry | null>(null)
export function useSceneRegistry() {
  const registry = useContext(SceneRegistryContext)
  if (!registry) throw new Error("SceneRegistryContext is required")
  return registry
}
