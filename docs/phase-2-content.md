# Phase 2: content and data architecture

The public resume was updated from `Nebiyu_Haile_Resume2026.pdf`. The four featured projects are RouteAlpha, CodeGuide, SAFEHR, and EMDC. Technical explanations are drawn from the resume; architecture layers without supporting details are omitted. RouteAlpha uses OpenRouter in the supplied resume. Native/platform layers and other providers are supported by the schema for future case studies.

## One content contract, two views

`src/content/schema.ts` defines Zod schemas and inferred TypeScript types for the resume and projects. The loader validates CMS and JSON responses before accepting them. Sanity and Contentful adapters preserve `caseStudy`, education, and activities. When sources are unavailable or invalid, the bundled, validated resume supplies the same real portfolio content.

`SectionContent.tsx` renders each section in both the glass panels and Scroll view. This keeps project architecture, outcomes, contact links, education, experience, and activities consistent between views. Projects without a case study still render their summary, technologies, bullets, and links.

An optional project `caseStudy` supports:

- `problem`, `role`: context and contribution.
- `frontend`, `backend`, `platform`: separate layers, each with `summary`, `tech`, and `details`.
- `flow`: ordered request/data-flow steps.
- `decisions`: entries with `title`, `decision`, and optional `tradeoff`.
- `outcomes`: reported results.

In Contentful, `caseStudy` can be a JSON field. Sanity projects expose the same object structure. For example:

```json
{
  "name": "Project name",
  "summary": "What the system does",
  "tech": ["React", "Next.js", "FastAPI", "PostgreSQL"],
  "links": {},
  "caseStudy": {
    "frontend": {
      "summary": "Client responsibilities",
      "tech": ["React", "Next.js"],
      "details": ["Documented frontend implementation"]
    },
    "backend": {
      "summary": "Service and data responsibilities",
      "tech": ["FastAPI", "PostgreSQL"],
      "details": ["Documented backend implementation"]
    },
    "decisions": [
      { "title": "A design decision", "decision": "The chosen approach", "tradeoff": "Its cost" }
    ],
    "outcomes": ["A verified result"]
  }
}
```

## Panels and navigation

Framer Motion `AnimatePresence` handles panel entry, exit, and section changes. Content blocks stagger on entry. Zustand provides the selected node, resume, and reduced-motion preference. Glass surfaces sit at z-index 30 over the scene, with translucent backgrounds and `backdrop-filter`; navigation remains at z-index 50. Panels are nonmodal dialogs so the persistent navigation remains keyboard-accessible. Escape closes the panel, exit content becomes inert, and focus returns to the section button after closing. Touch gestures are disabled while reading a panel so vertical scrolling cannot dismiss it.

## Automatic fallback

`useViewPreferences` rehydrates saved view preferences, checks support, and applies automatic fallback before permitting a Canvas mount. It listens for changes to reduced motion, the mobile media query, and supported connection preferences.

Scroll view is selected for:

- `prefers-reduced-motion: reduce` or unavailable WebGL.
- Small touch devices with reported memory of 4 GB or less, 4 logical cores or fewer, or Data Saver enabled.
- Small touch devices without the memory API, using a conservative default.

These are capability heuristics; browsers do not expose a universal low-power-mode API. Visitors can explicitly switch views. Turning reduced motion off does not automatically restart 3D. Supported preference changes toward reduced motion select Scroll view immediately. The Scroll layout renders all content without animation or a Canvas.

The capability APIs have limited browser availability: [deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory) and [saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData). Panel lifecycle follows [Motion’s AnimatePresence API](https://motion.dev/docs/react-animate-presence).

## Verification

```sh
npm run test:content
npm run test:navigation
npm run build
npm run typecheck
```

Content tests cover the updated resume, optional/legacy case studies, invalid architecture data and unsafe links, independently rendered frontend/backend/native layers, linear section anchors, and fallback heuristics. Browser verification on the production build additionally covered glass styling and stacking, panel/Scroll project parity, keyboard focus restoration, initial and live reduced motion, a low-memory touch viewport, native document scrolling and Overview reset, panel scrolling, failed-fetch content fallback, and test-only LiteLLM/native layers. No runtime errors were observed.
