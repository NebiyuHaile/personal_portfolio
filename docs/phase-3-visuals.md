# Phase 3: visual polish and mechanics

The active R3F scene now contains a procedural shader sun, four transmissive glass planets, elliptical orbit guides, and a generated reflection environment. All visuals are local: the environment is captured from Drei Lightformers once, with no remote HDR or image textures.

## Motion and camera coordination

`src/scene/mechanics.ts` defines four independent orbital configurations with unequal X/Z radii, starting phases, orbital speeds, spin speeds, and axial tilts. `orbitPosition` evaluates `x = radiusX * cos(angle)` and `z = radiusZ * sin(angle)`. Guides use the same radii and memoized points. Geometry stays spherical; the ellipse is applied to positions rather than scaling the entire system.

`SolarSystem` reads R3F pointer coordinates and exponentially damps a small system-wide rotation (up to 0.07 radians on X and 0.1 on Y). Group tilt runs before orbital updates, which run before the camera frame. Orbit phases pause while a section is selected. Parallax pauses during focus and camera transitions so the selected world position remains stable. Closing the panel resumes the overview mechanics.

`SceneRegistry` stores Three.js node refs outside Zustand. Camera navigation captures the selected node's current world position, including parent tilt, and uses that snapshot for the existing quaternion camera arc. Per-frame transforms stay in refs. Reduced motion stops orbital/spin movement and shader time, bypasses parallax, and snaps camera transitions. The automatic Scroll fallback from Phase 2 remains active.

## Materials

`materials/solar.ts` defines two GLSL materials through Drei `shaderMaterial`. The core has time-varying plasma granulation and an HDR rim. The additive, camera-facing corona uses radial falloff and animated angular rays. Materials are explicitly disposed on unmount.

Glass planets use `MeshPhysicalMaterial` with transmission 0.94, roughness 0.075, thickness 0.65, IOR 1.45, tinted attenuation, clearcoat, and environment intensity 1.4. Drei Environment captures a 256px cube map from colored rectangular Lightformers once. The scene environment supplies the reflection/refraction lighting to the physical materials.

## Post-processing

`Selection` contains the scene and composer; only the sun subtree is wrapped in `Select`. The selected renderables are the core and corona, leaving glass planets, orbit guides, and stars out of Bloom. Relevant light refs are supplied to `SelectiveBloom`. The composer uses selective Bloom, tone mapping, and SMAA, with multisampling and renderer MSAA disabled to avoid redundant antialiasing.

References: [selective Bloom](https://react-postprocessing.docs.pmnd.rs/effects/selective-bloom), [SMAA](https://react-postprocessing.docs.pmnd.rs/effects/smaa).

## Verification

```sh
npm run test:mechanics
npm run test:navigation
npm run test:content
npm run build
npm run typecheck
```

Mechanics tests verify the ellipse equation over full revolutions for all four planets and frame-rate-independent damping. Navigation tests include capturing a moving node's world position without mutating the input. Production Chromium checks inspect the live R3F scene and GPU effects to verify shader compilation, physical material settings, a populated environment map, sun-only Bloom selection, SMAA, orbital movement, pointer tilt, moving-mesh picking, exact camera focus, interrupted navigation, and reduced-motion freeze. Visual screenshots confirm the corona, reflection highlights, orbit guides, and glass panels. No shader or runtime errors were observed.
