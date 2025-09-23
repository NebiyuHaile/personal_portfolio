"use client";

import * as THREE from "three";
import { useProceduralRingAlpha } from "@/lib/useProceduralRingAlpha";

/**
 * Saturn rings as a single ringGeometry with a procedural alphaMap.
 * inner/outer are in the *same* units as your planet radius (Scene units).
 */
export function SaturnRings({
  inner = 0.35,
  outer = 0.80,
  color = 0xcfd8e3,
  tilt = THREE.MathUtils.degToRad(27),
}: {
  inner?: number;
  outer?: number;
  color?: number | string;
  tilt?: number;
}) {
  const alpha = useProceduralRingAlpha(1024);

  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, outer, 256]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          alphaMap={alpha}
          opacity={1}
          roughness={0.65}
          metalness={0.0}
          alphaTest={0.03}          // trims fringe
          polygonOffset={true}       // avoids z-fighting with the planet surface
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
}
