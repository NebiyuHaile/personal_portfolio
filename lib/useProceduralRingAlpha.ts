import * as THREE from "three";
import { useMemo } from "react";

/**
 * Generates a CanvasTexture you can use as alphaMap for ring materials.
 * White = fully visible, black = transparent. Greys = partial opacity.
 * Size 1024–2048 recommended for crisp edges.
 */
export function useProceduralRingAlpha(size = 1024) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const cx = size / 2;
    const cy = size / 2;

    // Fill black (fully transparent areas)
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    // Helper: soft annulus with radial gradient (inner r0 → outer r1)
    const band = (r0: number, r1: number, a0: number, a1: number) => {
      const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
      g.addColorStop(0, `rgba(255,255,255,${a0})`);
      g.addColorStop(1, `rgba(255,255,255,${a1})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      ctx.arc(cx, cy, r0, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    };

    // === Profile (approx. Saturn with Cassini division) ===
    // Map everything in [0..1], we’ll scale to geometry later.
    const R0 = size * 0.37; // normalized inner radius
    const R1 = size * 0.50; // normalized outer radius

    // Inner faint rings
    band(R0 + (R1 - R0) * 0.00, R0 + (R1 - R0) * 0.15, 0.50, 0.35);

    // Brighter main band
    band(R0 + (R1 - R0) * 0.18, R0 + (R1 - R0) * 0.42, 0.75, 0.55);

    // Cassini Division (dark gap) – we “subtract” by painting a darker band
    // Simply overlay a darker transparent band (lower alpha) in that zone
    band(R0 + (R1 - R0) * 0.42, R0 + (R1 - R0) * 0.48, 0.12, 0.08);

    // Outer fading band
    band(R0 + (R1 - R0) * 0.48, R1, 0.40, 0.05);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [size]);
}
