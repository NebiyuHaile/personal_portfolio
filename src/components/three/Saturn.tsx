"use client";

import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { SaturnRings } from "./SaturnRings";

export function Saturn({
  radius = 0.24,                 // planet radius in your scene scale
  tilt = THREE.MathUtils.degToRad(27),
  map = "/textures/saturn_albedo.jpg",
  ringInner = 0.35,
  ringOuter = 0.80,
}: {
  radius?: number;
  tilt?: number;
  map?: string;
  ringInner?: number;
  ringOuter?: number;
}) {
  const albedo = useTexture(map);
  albedo.colorSpace = THREE.SRGBColorSpace;

  return (
    <group rotation={[0, 0, 0]}>
      {/* Planet */}
      <mesh rotation={[0, tilt, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={albedo} roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Rings share the same tilt */}
      <SaturnRings inner={radius + ringInner} outer={radius + ringOuter} tilt={tilt} />
    </group>
  );
}
