"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Quaternion, Vector3 } from "three"
import { usePortfolioStore } from "@/src/store/portfolio"
import { createCameraTransition, sampleCameraTransition } from "@/src/scene/navigation"

import { useSceneRegistry } from "./SceneRegistry"

export function CameraRig() {
  const registry = useSceneRegistry()
  const worldPosition = useRef(new Vector3())
  const camera = useThree((state) => state.camera)
  const activeNode = usePortfolioStore((state) => state.activeNode)
  const transitionId = usePortfolioStore((state) => state.transitionId)
  const reducedMotion = usePortfolioStore((state) => state.reducedMotion)
  const finishTransition = usePortfolioStore((state) => state.finishTransition)
  const arc = useRef(new Quaternion())
  const transition = useRef<ReturnType<typeof createCameraTransition> | null>(null)
  const elapsed = useRef(0)

  useEffect(() => {
    const node = activeNode ? registry.get(activeNode) : undefined
    node?.updateWorldMatrix(true, false)
    const target = node?.getWorldPosition(worldPosition.current)
    transition.current = createCameraTransition(camera.position, camera.quaternion, activeNode, target)
    elapsed.current = 0
    if (reducedMotion) {
      sampleCameraTransition(transition.current, 1, camera.position, camera.quaternion, arc.current)
      transition.current = null
      finishTransition(transitionId)
    }
  }, [camera, activeNode, transitionId, reducedMotion, finishTransition, registry])

  useFrame((_, delta) => {
    if (!transition.current) return
    elapsed.current += delta
    const progress = Math.min(elapsed.current / 1.1, 1)
    sampleCameraTransition(transition.current, progress, camera.position, camera.quaternion, arc.current)
    if (progress === 1) {
      transition.current = null
      finishTransition(transitionId)
    }
  })

  return null
}
