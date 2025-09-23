// components/three/NebulaBackdrop.tsx
'use client'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

export default function NebulaBackdrop({
  opacity = 0.18,               // <- dial between 0.10 – 0.22
  tint = '#121a2b',             // deep blue tint to cool the reds
  distance = 60,                // how far behind the camera the plane sits
}: { opacity?: number; tint?: THREE.ColorRepresentation; distance?: number }) {
  const plane = useRef<THREE.Mesh>(null)
  const { camera, gl } = useThree()
  const tex = useTexture('/textures/nebula.jpg')

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8)
    tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
    tex.repeat.set(1.2, 1.2) // slight scale so stars aren’t “too big”
  }, [tex, gl])

  useFrame(() => {
    if (!plane.current) return
    // Keep the backdrop always behind the camera and facing forward
    plane.current.position.copy(camera.position)
    plane.current.quaternion.copy(camera.quaternion)
    plane.current.translateZ(-distance)
  })

  return (
    <mesh ref={plane} renderOrder={-100}>
      {/* Wide aspect plane to cover screens incl. ultrawide */}
      <planeGeometry args={[140, 80]} />
      <meshBasicMaterial
        map={tex}
        color={new THREE.Color(tint)}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}
