"use client"

import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Line } from "@react-three/drei"
import { Group, Mesh, Vector3 } from "three"
import { usePortfolioStore } from "@/src/store/portfolio"
import { SECTIONS } from "@/src/content/sections"
import { ORBITS, orbitPosition, damp, type OrbitConfig } from "@/src/scene/mechanics"
import { useSceneRegistry } from "./SceneRegistry"
import { Sun } from "./Sun"

function Planet({ config, labels }: { config: OrbitConfig; labels: RefObject<HTMLDivElement | null> }) {
  const ref = useRef<Mesh>(null)
  const time = useRef(0)
  const registry = useSceneRegistry()
  const activeNode = usePortfolioStore((state) => state.activeNode)
  const reducedMotion = usePortfolioStore((state) => state.reducedMotion)
  const selectNode = usePortfolioStore((state) => state.selectNode)
  const setHoveredIndex = usePortfolioStore((state) => state.setHoveredIndex)
  const position = useMemo(() => orbitPosition(config, 0, new Vector3()).toArray(), [config])
  useFrame((_, delta) => {
    if (!ref.current) return
    if (!reducedMotion && !activeNode) time.current += Math.min(delta, .1)
    orbitPosition(config, time.current, ref.current.position)
    if (!reducedMotion) ref.current.rotation.y += Math.min(delta, .1) * config.spin
  }, -1)
  return <mesh name={`planet-${config.id}`} position={position} rotation={[config.tilt, 0, 0]} scale={activeNode === config.id ? 1.08 : 1}
    ref={(mesh) => { ref.current = mesh; if (mesh) registry.set(config.id, mesh); else registry.delete(config.id) }}
    onClick={(event) => { event.stopPropagation(); selectNode(config.id) }}
    onPointerOver={(event) => { event.stopPropagation(); setHoveredIndex(SECTIONS.findIndex((section) => section.id === config.id)) }}
    onPointerOut={() => setHoveredIndex(null)}>
    <sphereGeometry args={[config.size, 64, 40]} />
    <meshPhysicalMaterial color={config.color} transmission={.94} thickness={.65} roughness={.075} metalness={0} ior={1.45} clearcoat={1} clearcoatRoughness={.06} envMapIntensity={1.4} attenuationColor={config.color} attenuationDistance={2.5} />
    <Html portal={labels.current ? { current: labels.current } : undefined} position={[0, config.size + .24, 0]} center zIndexRange={[1, 0]} style={{ pointerEvents: "none", whiteSpace: "nowrap", color: "#d5e6f5", fontSize: 12 }}>{SECTIONS.find((section) => section.id === config.id)!.label}</Html>
  </mesh>
}

function OrbitPath({ config }: { config: OrbitConfig }) {
  const points = useMemo(() => Array.from({ length: 193 }, (_, index) => new Vector3(Math.cos(index / 192 * Math.PI * 2) * config.radiusX, 0, Math.sin(index / 192 * Math.PI * 2) * config.radiusZ)), [config])
  return <Line name={`orbit-${config.id}`} points={points} color="#6b92ad" transparent opacity={.22} lineWidth={1} />
}

export function SolarSystem({ labels }: { labels: RefObject<HTMLDivElement | null> }) {
  const ref = useRef<Group>(null)
  const reducedMotion = usePortfolioStore((state) => state.reducedMotion)
  const activeNode = usePortfolioStore((state) => state.activeNode)
  const isAnimating = usePortfolioStore((state) => state.isAnimating)
  useFrame(({ pointer }, delta) => {
    if (!ref.current || activeNode || isAnimating) return
    ref.current.rotation.x = damp(ref.current.rotation.x, reducedMotion ? 0 : pointer.y * .07, delta)
    ref.current.rotation.y = damp(ref.current.rotation.y, reducedMotion ? 0 : pointer.x * .1, delta)
  }, -2)
  return <group ref={ref} name="solar-system">
    <Sun labels={labels} />
    {ORBITS.map((config) => <OrbitPath key={`path-${config.id}`} config={config} />)}
    {ORBITS.map((config) => <Planet key={config.id} config={config} labels={labels} />)}
  </group>
}
