# Phase 1: core architecture and navigation

The Next.js App Router page hosts the persistent HTML navigation, content panels, Scroll view, and a dynamically loaded React Three Fiber Canvas. Introduction is the central sun; Experience, Projects, Skills, and Contact are four geometric planet placeholders.

`src/content/sections.ts` defines stable section IDs. The Zustand store owns `activeNode`, `viewMode` (`orbital` or `scroll`), `isAnimating`, and a transition ID. Navigation buttons and mesh clicks both call `selectNode`. The existing index/list/panel APIs remain synchronized adapters for the accessibility and gesture components. Only view and performance preferences persist; camera state does not.

`CameraRig` is the only active camera writer. It uses `useFrame` rather than its own animation loop. Navigation captures the current position and orientation, allowing an interrupted transition to continue without jumping. Camera offset direction and orientation use quaternion slerp, with radius interpolation and smoothstep timing over 1.1 seconds. Completion is accepted only for the current transition ID. Reduced motion snaps to the endpoint.

Drei HTML labels use a dedicated portal container so switching views cleans up their React roots without sharing the Canvas host. Scroll view unmounts the Canvas and navigates to the existing section headings. Closing a panel or choosing Overview returns the camera to its initial pose.

## Verification

Run checks sequentially; Next.js builds regenerate `.next/types` used by TypeScript:

```sh
npm run test:navigation
npm run build
npm run typecheck
```

The eight navigation tests cover all five camera endpoints and return paths, finite normalized quaternions, curved movement, interruption continuity, stale completion rejection, DOM/scene state synchronization, reduced motion, and persisted view hydration.

Browser verification on the production build covered all section buttons, rapid selection changes, sun mesh picking, Overview, Scroll view and reload persistence, Space/Escape keyboard input, a 390px viewport, and reduced-motion changes. No runtime errors remained after the label portal fix. GPU performance tuning and final materials belong to later phases.
