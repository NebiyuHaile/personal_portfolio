"use client"

import * as THREE from "three"
import { useMemo, useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export type SceneProps = {
  onNodeClick?: (index: number) => void
  onNodeHover?: (index: number | null) => void
  focusedIndex?: number // -1 when none focused
}

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */
const PLANETS = [
  { r: 1.3, size: 0.12, color: 0xbdd4ff, speed: 0.18, label: "Introduction" },
  { r: 1.85, size: 0.14, color: 0xa5b4fc, speed: 0.14, label: "Experience" },
  { r: 2.45, size: 0.16, color: 0x7dd3fc, speed: 0.11, label: "Projects" },
  { r: 3.05, size: 0.18, color: 0xfca5a5, speed: 0.09, label: "Skills" },
  { r: 3.65, size: 0.21, color: 0xfde68a, speed: 0.07, label: "Contact" },
]

const CAMERA_POS: [number, number, number] = [0, 5.2, 7.2]
const PLANE_TILT_X = THREE.MathUtils.degToRad(-65)
const ELLIPSE_SCALE_Z = 0.88

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */
function useCursor(hovering: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = hovering ? "pointer" : "default"
  }
}

function IdleParallax() {
  const { camera } = useThree()
  const t0 = useRef(performance.now())
  useFrame(() => {
    const t = (performance.now() - t0.current) / 1000
    const yaw = Math.sin(t * 0.1) * THREE.MathUtils.degToRad(2.2)
    camera.rotation.set(camera.rotation.x, yaw, camera.rotation.z)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Space background (procedural stars)                                */
/* ------------------------------------------------------------------ */
function Stars({ count = 1600, radius = 70 }) {
  const geom = useMemo(() => new THREE.BufferGeometry(), [])
  useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const s = radius * (0.85 + Math.random() * 0.35)
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const v = new THREE.Vector3(
        s * Math.sin(phi) * Math.cos(theta),
        s * Math.cos(phi) * 0.55,
        s * Math.sin(phi) * Math.sin(theta),
      )
      arr.set([v.x, v.y, v.z], i * 3)
    }
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3))
  }, [geom, count, radius])

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0x9fb7ff,
        size: 0.012,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    [],
  )

  return <points geometry={geom} material={mat} />
}

/* ------------------------------------------------------------------ */
/* Sun (single luminous core + additive halos — no visible inner ball) */
/* ------------------------------------------------------------------ */
function makeRadialGlowTexture(stops: Array<[number, string]>, size = 256) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [pos, color] of stops) g.addColorStop(pos, color)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Sun() {
  const coreColor = new THREE.Color("#ffc86a")

  const innerTex = useMemo(
    () =>
      makeRadialGlowTexture([
        [0.0, "rgba(255,255,230,1.0)"],
        [0.45, "rgba(255,230,160,0.85)"],
        [1.0, "rgba(255,210,120,0.0)"],
      ]),
    [],
  )

  const outerTex = useMemo(
    () =>
      makeRadialGlowTexture([
        [0.0, "rgba(255,205,120,0.45)"],
        [0.6, "rgba(255,190,100,0.18)"],
        [1.0, "rgba(255,190,100,0.00)"],
      ]),
    [],
  )

  return (
    <group>
      {/* Luminous sun core (no shading) */}
      <mesh>
        <sphereGeometry args={[0.52, 64, 64]} />
        <meshBasicMaterial color={coreColor} toneMapped={false} />
      </mesh>

      {/* Tight hot bloom */}
      <sprite scale={[1.6, 1.6, 1]}>
        <spriteMaterial
          map={innerTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* Outer halo */}
      <sprite scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={outerTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Orbits & Planets                                                   */
/* ------------------------------------------------------------------ */
function Orbit({ radius }: { radius: number }) {
  const geomRef = useRef<THREE.BufferGeometry>(null)

  // positions are computed once and guaranteed finite
  const positions = useMemo(() => {
    const segs = 256
    const arr = new Float32Array((segs + 1) * 3)
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2
      const x = Math.cos(a) * radius
      const z = Math.sin(a) * radius
      const j = i * 3
      arr[j + 0] = x
      arr[j + 1] = 0
      arr[j + 2] = z
    }
    return arr
  }, [radius])

  useEffect(() => {
    const g = geomRef.current
    if (!g) return
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.computeBoundingSphere() // safe
  }, [positions])

  return (
    <line frustumCulled={false}>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial color={"#273244"} transparent opacity={0.42} />
    </line>
  )
}

function Planet({
  index,
  color,
  size,
  orbitRadius,
  speed,
  label,
  focused,
  onClick,
  onHover,
  seedAngle,
}: {
  index: number
  color: number
  size: number
  orbitRadius: number
  speed: number
  label: string
  focused: boolean
  seedAngle: number
  onClick?: (i: number) => void
  onHover?: (i: number | null) => void
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const angleRef = useRef(seedAngle)
  const [hover, setHover] = useState(false)
  const [isCursorOver, setIsCursorOver] = useState(false)
  const [position, setPosition] = useState(() => {
    const x = Math.cos(seedAngle) * orbitRadius
    const z = Math.sin(seedAngle) * orbitRadius
    return [x, 0, z] as [number, number, number]
  })

  useFrame((_, dt) => {
    if (!ref.current) return

    angleRef.current += speed * dt
    const a = angleRef.current
    const x = Math.cos(a) * orbitRadius
    const z = Math.sin(a) * orbitRadius

    ref.current.position.set(x, 0, z)

    ref.current.rotation.y += dt * 0.25
    const s = hover || focused ? 1.06 : 1.0
    ref.current.scale.lerp({ x: s, y: s, z: s } as any, 0.15)
  })

  useCursor(isCursorOver)

  return (
    <mesh
      ref={ref}
      onPointerDown={() => onClick?.(index)}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        setIsCursorOver(true)
        onHover?.(index)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHover(false)
        setIsCursorOver(false)
        onHover?.(null)
      }}
    >
      <sphereGeometry args={[size, 42, 42]} />
      {/* Physical material supports clearcoat */}
      <meshPhysicalMaterial
        color={color}
        roughness={0.6}
        metalness={0.03}
        clearcoat={0.4}
        clearcoatRoughness={0.85}
        envMapIntensity={0.5}
      />
      <Html
        position={[0, size + 0.18, 0]}
        center
        distanceFactor={8}
        style={{
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: 600,
          opacity: hover || focused ? 1 : 0,
          transition: "opacity 220ms ease",
          pointerEvents: "none",
          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        }}
      >
        {label}
      </Html>
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Diagram plane                                                      */
/* ------------------------------------------------------------------ */
function DiagramPlane({
  onNodeClick,
  onNodeHover,
  focusedIndex = -1,
}: Pick<SceneProps, "onNodeClick" | "onNodeHover" | "focusedIndex">) {
  return (
    <group rotation={[PLANE_TILT_X, 0, 0]} scale={[1, 1, ELLIPSE_SCALE_Z]}>
      {/* Sun (luminous, no inner core visible) */}
      <Sun />

      {/* Orbits */}
      {PLANETS.map((p, i) => (
        <Orbit key={`orbit-${i}`} radius={p.r} />
      ))}

      {/* Planets */}
      {PLANETS.map((p, i) => (
        <Planet
          key={`planet-${i}`}
          index={i}
          label={p.label}
          color={p.color}
          size={p.size}
          orbitRadius={p.r}
          speed={p.speed}
          focused={focusedIndex === i}
          seedAngle={(i / PLANETS.length) * Math.PI * 2 - Math.PI / 2}
          onClick={onNodeClick}
          onHover={onNodeHover}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Scene root                                                         */
/* ------------------------------------------------------------------ */
export default function Scene(props: SceneProps) {
  return (
    <Canvas
      className="absolute inset-0 !h-full !w-full"
      style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
      dpr={[1, 2]}
      camera={{ position: CAMERA_POS, fov: 45, near: 0.1, far: 200 }}
      frameloop="always"
      gl={{ antialias: true }}
      onCreated={({ camera }) => {
        camera.position.set(...CAMERA_POS)
      }}
    >
      {/* Space background */}
      <color attach="background" args={["#0b1220"]} />
      <Stars />

      {/* Lights (for planets only; Sun is self-lit) */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 3]} intensity={1.0} />
      <directionalLight position={[-6, 2, -4]} intensity={0.35} color={0x88aaff} />

      {/* Diagram */}
      <DiagramPlane
        onNodeClick={props.onNodeClick}
        onNodeHover={props.onNodeHover}
        focusedIndex={props.focusedIndex ?? -1}
      />

      {/* Subtle camera breathing */}
      <IdleParallax />

      {/* Post FX */}
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.0} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.25} darkness={0.6} />
      </EffectComposer>

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.35}
        minPolarAngle={THREE.MathUtils.degToRad(35)}
        maxPolarAngle={THREE.MathUtils.degToRad(70)}
        minAzimuthAngle={THREE.MathUtils.degToRad(-15)}
        maxAzimuthAngle={THREE.MathUtils.degToRad(15)}
      />
    </Canvas>
  )
}
