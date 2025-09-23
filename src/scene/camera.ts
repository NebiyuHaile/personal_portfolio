// Camera control and animation system
import * as THREE from "three"
import { motionConfig } from "@/src/lib/motionConfig"

export class CameraController {
  private camera: THREE.PerspectiveCamera
  private defaultPosition = new THREE.Vector3(0, 2, 8)
  private defaultTarget = new THREE.Vector3(0, 0, 0)
  private isAnimating = false

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
  }

  public focusOnNode(nodePosition: THREE.Vector3, callback?: () => void) {
    if (this.isAnimating) return

    this.isAnimating = true
    const startPosition = this.camera.position.clone()
    const startTarget = new THREE.Vector3(0, 0, 0)

    // Calculate focus position (offset from node)
    const focusPosition = nodePosition.clone().add(new THREE.Vector3(0, 1.2, 2.6))
    const focusTarget = nodePosition.clone()

    const duration = motionConfig.camera.duration
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Exponential easing out
      const eased = 1 - Math.pow(1 - progress, 3)

      // Interpolate position and target
      this.camera.position.lerpVectors(startPosition, focusPosition, eased)
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget, focusTarget, eased)
      this.camera.lookAt(currentTarget)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.isAnimating = false
        callback?.()
      }
    }

    animate()
  }

  public returnToDefault(callback?: () => void) {
    if (this.isAnimating) return

    this.isAnimating = true
    const startPosition = this.camera.position.clone()
    const duration = motionConfig.camera.duration
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Exponential easing out
      const eased = 1 - Math.pow(1 - progress, 3)

      this.camera.position.lerpVectors(startPosition, this.defaultPosition, eased)
      this.camera.lookAt(this.defaultTarget)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.isAnimating = false
        callback?.()
      }
    }

    animate()
  }

  public isCurrentlyAnimating() {
    return this.isAnimating
  }
}
