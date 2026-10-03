import { Matrix4, Quaternion, Vector3 } from "three"
import { ORBITS, orbitPosition } from "./mechanics"
import type { NodeId } from "@/src/content/sections"

export const OVERVIEW = new Vector3(0, 6, 10)
export const NODE_POSITIONS = Object.fromEntries([
  ["introduction", [0, 0, 0]],
  ...ORBITS.map((config) => [config.id, orbitPosition(config, 0, new Vector3()).toArray()]),
]) as Record<NodeId, [number, number, number]>
const UP = new Vector3(0, 1, 0)
const FORWARD = new Vector3(0, 0, 1)

export function createCameraTransition(position: Vector3, orientation: Quaternion, node: NodeId | null, worldPosition?: Vector3) {
  const target = node ? (worldPosition?.clone() ?? new Vector3(...NODE_POSITIONS[node])) : new Vector3()
  const destination = node ? target.clone().add(new Vector3(0, 1.8, 3.8)) : OVERVIEW.clone()
  const startOffset = position.clone().sub(target)
  const endOffset = destination.clone().sub(target)
  return {
    target,
    destination,
    startRadius: startOffset.length(),
    endRadius: endOffset.length(),
    startArc: new Quaternion().setFromUnitVectors(FORWARD, startOffset.normalize()),
    endArc: new Quaternion().setFromUnitVectors(FORWARD, endOffset.normalize()),
    startOrientation: orientation.clone(),
    endOrientation: new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(destination, target, UP)),
  }
}

export function sampleCameraTransition(
  transition: ReturnType<typeof createCameraTransition>,
  progress: number,
  position: Vector3,
  orientation: Quaternion,
  arc: Quaternion,
) {
  const t = Math.max(0, Math.min(1, progress))
  const eased = t * t * (3 - 2 * t)
  arc.slerpQuaternions(transition.startArc, transition.endArc, eased)
  position.copy(FORWARD).applyQuaternion(arc)
    .multiplyScalar(transition.startRadius + (transition.endRadius - transition.startRadius) * eased)
    .add(transition.target)
  orientation.slerpQuaternions(transition.startOrientation, transition.endOrientation, eased)
}
