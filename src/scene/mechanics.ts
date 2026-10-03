import { Vector3 } from "three"
import type { NodeId } from "@/src/content/sections"

export interface OrbitConfig {
  id: Exclude<NodeId, "introduction">
  radiusX: number
  radiusZ: number
  phase: number
  speed: number
  spin: number
  tilt: number
  size: number
  color: string
}

export const ORBITS: OrbitConfig[] = [
  { id: "experience", radiusX: 1.9, radiusZ: 1.25, phase: 3.8, speed: 0.07, spin: 0.17, tilt: 0.25, size: 0.27, color: "#c4b5fd" },
  { id: "projects", radiusX: 2.7, radiusZ: 1.8, phase: 5.5, speed: 0.055, spin: 0.13, tilt: -0.3, size: 0.34, color: "#a5f3fc" },
  { id: "skills", radiusX: 3.4, radiusZ: 2.25, phase: 2.2, speed: 0.04, spin: 0.2, tilt: 0.4, size: 0.3, color: "#fecdd3" },
  { id: "contact", radiusX: 4.1, radiusZ: 2.75, phase: 0.65, speed: 0.03, spin: 0.1, tilt: -0.2, size: 0.38, color: "#fde68a" },
]

export function orbitPosition(config: Pick<OrbitConfig, "radiusX" | "radiusZ" | "phase" | "speed">, time: number, target: Vector3) {
  const angle = config.phase + time * config.speed
  return target.set(Math.cos(angle) * config.radiusX, 0, Math.sin(angle) * config.radiusZ)
}

export function damp(current: number, target: number, delta: number, rate = 4) {
  return current + (target - current) * (1 - Math.exp(-rate * Math.min(delta, 0.1)))
}
