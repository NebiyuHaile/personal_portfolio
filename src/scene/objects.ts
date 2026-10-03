// Sun and node objects
import * as THREE from "three"

export interface NodeObject extends THREE.Group {
  userData: {
    id: string
    index: number
    originalPosition: THREE.Vector3
  }
}

export class SolarObjects {
  public sun = new THREE.Group()
  public nodes: NodeObject[] = []
  private scene: THREE.Scene
  private nodeLabels: THREE.Sprite[] = [] // Added node labels

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.createSun()
    this.createNodes()
  }

  private createSun() {
    this.sun = new THREE.Group()

    // Central sun sphere
    const sunGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
    })
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
    this.sun.add(sunMesh)

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.2,
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    this.sun.add(glowMesh)

    this.scene.add(this.sun)
  }

  private createNodes() {
    const nodeNames = ["Introduction", "Experience", "Projects", "Skills", "Contact"]
    const colors = [0x64b5f6, 0x81c784, 0xffb74d, 0xf06292, 0x9575cd]
    const radius = 4

    nodeNames.forEach((name, index) => {
      const angle = (index / nodeNames.length) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = 0.15 * Math.sin(0.6 * angle)

      const nodeGroup = new THREE.Group() as NodeObject
      nodeGroup.userData = {
        id: name.toLowerCase(),
        index,
        originalPosition: new THREE.Vector3(x, y, z),
      }

      // Node disc with enhanced glow
      const discGeometry = new THREE.CircleGeometry(0.4, 16)
      const discMaterial = new THREE.MeshLambertMaterial({
        color: colors[index],
        transparent: true,
        opacity: 0.9, // Increased opacity for better visibility
        emissive: colors[index],
        emissiveIntensity: 0.1, // Added subtle emissive glow
      })
      const disc = new THREE.Mesh(discGeometry, discMaterial)
      disc.lookAt(0, 0, 0)
      nodeGroup.add(disc)

      // Orbit ring
      const ringGeometry = new THREE.RingGeometry(0.5, 0.52, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: colors[index],
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      nodeGroup.add(ring)

      const labelCanvas = this.createLabelCanvas(name)
      const labelTexture = new THREE.CanvasTexture(labelCanvas)
      const labelMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.9,
      })
      const labelSprite = new THREE.Sprite(labelMaterial)
      labelSprite.scale.set(2, 0.5, 1)
      labelSprite.position.set(x, y - 0.8, z) // Position below node
      this.nodeLabels.push(labelSprite)
      this.scene.add(labelSprite)

      nodeGroup.position.set(x, y, z)
      this.nodes.push(nodeGroup)
      this.scene.add(nodeGroup)
    })
  }

  private createLabelCanvas(text: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")!

    canvas.width = 256
    canvas.height = 64

    context.fillStyle = "rgba(0, 0, 0, 0.7)"
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = "#ffffff"
    context.font = "bold 18px Arial"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    return canvas
  }

  public updateNodeBillboards(camera: THREE.Camera) {
    this.nodes.forEach((node) => {
      const disc = node.children[0] as THREE.Mesh
      disc.lookAt(camera.position)
    })
  }

  public updateLabelPositions() {
    this.nodes.forEach((node, index) => {
      const label = this.nodeLabels[index]
      if (label) {
        label.position.copy(node.position)
        label.position.y -= 0.8 // Keep labels below nodes
      }
    })
  }

  public highlightNode(index: number) {
    this.nodes.forEach((node, i) => {
      const disc = node.children[0] as THREE.Mesh
      const material = disc.material as THREE.MeshLambertMaterial

      if (i === index) {
        material.emissiveIntensity = 0.3 // Bright glow for focused node
        material.opacity = 1.0
      } else {
        material.emissiveIntensity = 0.1 // Dim other nodes
        material.opacity = 0.6
      }
    })
  }

  public resetHighlights() {
    this.nodes.forEach((node) => {
      const disc = node.children[0] as THREE.Mesh
      const material = disc.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.1
      material.opacity = 0.9
    })
  }
}
