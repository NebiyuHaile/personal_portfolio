"use client"

import { Suspense, useMemo, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Lightformer, Stars } from "@react-three/drei"
import { EffectComposer, SelectiveBloom, SMAA, ToneMapping } from "@react-three/postprocessing"
import { AmbientLight, Object3D, PointLight } from "three"
import { OVERVIEW } from "@/src/scene/navigation"
import { CameraRig } from "./CameraRig"
import { SolarSystem } from "./SolarSystem"
import { SceneRegistryContext } from "./SceneRegistry"
import type { NodeId } from "@/src/content/sections"

function OrbitalScene() {
  const labels = useRef<HTMLDivElement>(null)
  const registry = useMemo(() => new Map<NodeId, Object3D>(), [])
  const ambient = useMemo(() => new AmbientLight(0xffffff, .35), [])
  const sunlight = useMemo(() => {
    const light = new PointLight("#ffd2a0", 12)
    light.position.set(0, 1, 0)
    return light
  }, [])
  const [bloomSelection, setBloomSelection] = useState<Object3D[]>([])
  const lights = useMemo(() => [ambient, sunlight], [ambient, sunlight])
  return <div className="absolute inset-0">
    <div ref={labels} className="pointer-events-none absolute inset-0 z-10" />
    <Canvas
      className="absolute inset-0 !h-full !w-full"
      dpr={[1, 2]}
      camera={{ position: OVERVIEW.toArray(), fov: 45, near: .1, far: 200 }}
      gl={{ antialias: false, alpha: false }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <SceneRegistryContext.Provider value={registry}>
        <color attach="background" args={["#080f1d"]} />
        <primitive object={ambient} />
        <primitive object={sunlight} />
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1} background={false}>
            <color attach="background" args={["#101929"]} />
            <Lightformer form="rect" intensity={5} color="#b9eaff" position={[0, 5, -3]} scale={[8, 2, 1]} rotation={[Math.PI / 2, 0, 0]} />
            <Lightformer form="rect" intensity={2.5} color="#e9c3ff" position={[-4, 1, 2]} scale={[6, 3, 1]} rotation={[0, Math.PI / 2, 0]} />
            <Lightformer form="rect" intensity={3} color="#fff0c2" position={[4, 2, 1]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 2, 0]} />
          </Environment>
          <Stars radius={70} depth={20} count={1600} factor={2} fade speed={0} />
          <>
            <SolarSystem labels={labels} onBloomSelection={setBloomSelection} />
            <CameraRig />
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <SelectiveBloom selection={bloomSelection} lights={lights} intensity={.65} luminanceThreshold={1} luminanceSmoothing={.15} mipmapBlur radius={.55} levels={5} ignoreBackground />
              <ToneMapping />
              <SMAA />
            </EffectComposer>
          </>
        </Suspense>
      </SceneRegistryContext.Provider>
    </Canvas>
  </div>
}

export default OrbitalScene
