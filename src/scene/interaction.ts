// Interaction system for orbital navigation
import * as THREE from "three"
import type { NodeObject } from "./objects"
import { motionConfig } from "@/src/lib/motionConfig"

export interface InteractionCallbacks {
  onNodeClick: (index: number) => void
  onNodeHover: (index: number | null) => void
  onNavigate: (direction: "next" | "prev") => void
  onClose: () => void
}

export class InteractionController {
  private camera: THREE.PerspectiveCamera
  private nodes: NodeObject[]
  private canvas: HTMLCanvasElement
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()
  private callbacks: InteractionCallbacks

  // Scroll/wheel state
  private lastWheelTime = 0
  private wheelCooldown = motionConfig.wheel.cooldown

  // Touch state
  private touchStartX = 0
  private touchStartY = 0
  private isTouching = false

  // Hover state
  private hoveredIndex: number | null = null

  constructor(
    camera: THREE.PerspectiveCamera,
    nodes: NodeObject[],
    canvas: HTMLCanvasElement,
    callbacks: InteractionCallbacks,
  ) {
    this.camera = camera
    this.nodes = nodes
    this.canvas = canvas
    this.callbacks = callbacks

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("click", this.handleClick.bind(this))
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this))
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this))

    // Wheel/scroll events
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this), { passive: false })

    // Touch events
    this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false })
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false })
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this))

    // Keyboard events
    document.addEventListener("keydown", this.handleKeyDown.bind(this))
  }

  private updateMousePosition(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  private handleClick(event: MouseEvent) {
    this.updateMousePosition(event)
    const intersectedIndex = this.getIntersectedNodeIndex()

    if (intersectedIndex !== null) {
      this.callbacks.onNodeClick(intersectedIndex)
    }
  }

  private handleMouseMove(event: MouseEvent) {
    this.updateMousePosition(event)
    const intersectedIndex = this.getIntersectedNodeIndex()

    if (intersectedIndex !== this.hoveredIndex) {
      this.hoveredIndex = intersectedIndex
      this.callbacks.onNodeHover(intersectedIndex)

      // Update cursor
      this.canvas.style.cursor = intersectedIndex !== null ? "pointer" : "default"
    }
  }

  private handleMouseLeave() {
    if (this.hoveredIndex !== null) {
      this.hoveredIndex = null
      this.callbacks.onNodeHover(null)
      this.canvas.style.cursor = "default"
    }
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault()

    const now = Date.now()
    if (now - this.lastWheelTime < this.wheelCooldown) return

    this.lastWheelTime = now

    const direction = event.deltaY > 0 ? "next" : "prev"
    this.callbacks.onNavigate(direction)
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault()

    if (event.touches.length === 1) {
      this.isTouching = true
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault()
  }

  private handleTouchEnd(event: TouchEvent) {
    if (!this.isTouching) return

    this.isTouching = false

    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - this.touchStartX
      const deltaY = touch.clientY - this.touchStartY

      // Check if it's a tap (small movement)
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Handle tap as click
        const rect = this.canvas.getBoundingClientRect()
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1

        const intersectedIndex = this.getIntersectedNodeIndex()
        if (intersectedIndex !== null) {
          this.callbacks.onNodeClick(intersectedIndex)
        }
      } else if (Math.abs(deltaX) > 50) {
        // Horizontal swipe
        const direction = deltaX > 0 ? "prev" : "next"
        this.callbacks.onNavigate(direction)
      }
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case "ArrowRight":
      case "PageDown":
        event.preventDefault()
        this.callbacks.onNavigate("next")
        break

      case "ArrowLeft":
      case "PageUp":
        event.preventDefault()
        this.callbacks.onNavigate("prev")
        break

      case "Enter":
      case "Space":
        event.preventDefault()
        if (this.hoveredIndex !== null) {
          this.callbacks.onNodeClick(this.hoveredIndex)
        }
        break

      case "Escape":
        event.preventDefault()
        this.callbacks.onClose()
        break
    }
  }

  private getIntersectedNodeIndex(): number | null {
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Create intersection targets from node discs
    const targets: THREE.Object3D[] = []
    this.nodes.forEach((node) => {
      const disc = node.children[0] // First child is the disc
      if (disc) targets.push(disc)
    })

    const intersects = this.raycaster.intersectObjects(targets)

    if (intersects.length > 0) {
      // Find which node this disc belongs to
      const intersectedDisc = intersects[0].object
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].children[0] === intersectedDisc) {
          return i
        }
      }
    }

    return null
  }

  public dispose() {
    // Remove event listeners
    this.canvas.removeEventListener("click", this.handleClick.bind(this))
    this.canvas.removeEventListener("mousemove", this.handleMouseMove.bind(this))
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave.bind(this))
    this.canvas.removeEventListener("wheel", this.handleWheel.bind(this))
    this.canvas.removeEventListener("touchstart", this.handleTouchStart.bind(this))
    this.canvas.removeEventListener("touchmove", this.handleTouchMove.bind(this))
    this.canvas.removeEventListener("touchend", this.handleTouchEnd.bind(this))
    document.removeEventListener("keydown", this.handleKeyDown.bind(this))
  }
}
