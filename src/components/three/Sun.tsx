"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard, Html } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { AdditiveBlending } from "three"
import type { RefObject } from "react"
import { usePortfolioStore } from "@/src/store/portfolio"
import { useSceneRegistry } from "./SceneRegistry"
import { SolarCoreMaterial, SolarCoronaMaterial } from "./materials/solar"

export function Sun({ labels }: { labels: RefObject<HTMLDivElement | null> }) {
  const registry = useSceneRegistry()
  const selectNode = usePortfolioStore((state) => state.selectNode)
  const reducedMotion = usePortfolioStore((state) => state.reducedMotion)
  const core = useMemo(() => {
    const material = new SolarCoreMaterial()
    material.toneMapped = false
    return material
  }, [])
  const corona = useMemo(() => {
    const material = new SolarCoronaMaterial()
    material.transparent = true
    material.depthWrite = false
    material.blending = AdditiveBlending
    material.toneMapped = false
    return material
  }, [])
  useEffect(() => () => { core.dispose(); corona.dispose() }, [core, corona])
  useFrame((_, delta) => {
    if (!reducedMotion) { core.uTime += Math.min(delta, .1); corona.uTime = core.uTime }
  })
  return <Select enabled>
    <group name="sun-node" ref={(object) => { if (object) registry.set("introduction", object); else registry.delete("introduction") }}>
      <mesh name="sun" onClick={(event) => { event.stopPropagation(); selectNode("introduction") }}>
        <sphereGeometry args={[0.6, 64, 48]} />
        <primitive attach="material" object={core} />
      </mesh>
      <Billboard>
        <mesh name="solar-corona" renderOrder={1} raycast={() => {}}>
          <planeGeometry args={[3.2, 3.2]} />
          <primitive attach="material" object={corona} />
        </mesh>
      </Billboard>
      <Html portal={labels.current ? { current: labels.current } : undefined} position={[0, .95, 0]} center zIndexRange={[1, 0]} style={{ pointerEvents: "none", color: "#fce6b6", whiteSpace: "nowrap", fontSize: 12 }}>Introduction</Html>
    </group>
  </Select>
}
