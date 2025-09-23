import type { NodeObject } from "./objects"
import type * as THREE from "three"

export class OrbitController {
  private nodes: NodeObject[]
  private isOrbiting = true
  private startTime = Date.now()
  private focusedIndex = -1
  private reducedMotion = false // Added reduced motion support

  constructor(nodes: NodeObject[]) {
    this.nodes = nodes
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  public update() {
    if (!this.isOrbiting || this.reducedMotion) return // Respect reduced motion

    const elapsed = (Date.now() - this.startTime) * 0.0005 // slow rotation

    this.nodes.forEach((node, index) => {
      const baseAngle = (index / this.nodes.length) * Math.PI * 2
      const angle = baseAngle + elapsed
      const radius = 4

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 0.15 * Math.sin(0.6 * angle) // subtle vertical wobble

      node.position.set(x, y, z)
      node.userData.originalPosition.set(x, y, z)
    })
  }

  public pauseOrbit() {
    this.isOrbiting = false
  }

  public resumeOrbit() {
    this.isOrbiting = true
    this.startTime = Date.now()
  }

  public setFocusedNode(index: number) {
    this.focusedIndex = index
    if (index >= 0) {
      this.pauseOrbit()
    } else {
      this.resumeOrbit()
    }
  }

  public getFocusedIndex() {
    return this.focusedIndex
  }

  public getNodePosition(index: number): THREE.Vector3 | null {
    if (index >= 0 && index < this.nodes.length) {
      return this.nodes[index].position.clone()
    }
    return null
  }

  public getAllNodePositions(): THREE.Vector3[] {
    return this.nodes.map((node) => node.position.clone())
  }
}
