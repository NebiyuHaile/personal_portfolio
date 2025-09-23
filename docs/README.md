# Orbital Portfolio - Interactive Solar System Navigation

A unique portfolio website that replaces traditional vertical scrolling with an orbital navigation system. Users navigate through portfolio sections (Introduction, Experience, Projects, Skills, Contact) by interacting with nodes orbiting around a central "sun" in a 3D space.

## Features

- **Orbital Navigation**: 5 clickable nodes representing portfolio sections
- **Multiple Interaction Methods**: Click, scroll, swipe, keyboard navigation
- **Smooth Camera Transitions**: Exponential easing between focused and default views
- **Dynamic Content Loading**: Resume data loaded from JSON/MD/PDF files
- **Accessibility First**: Screen reader support, reduced motion detection, fallback list view
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Clamped pixel ratio, efficient rendering, debounced interactions

## Architecture

### Project Structure

\`\`\`
/src
  app/page.tsx              # Main application component
  scene/three.ts            # Three.js scene setup and management
  scene/objects.ts          # Sun and node 3D objects
  scene/orbit.ts            # Orbital positioning and animation
  scene/camera.ts           # Camera control and smooth transitions
  scene/interaction.ts      # Raycast, scroll, keyboard, touch handling
  content/loader.ts         # Resume data loading and normalization
  content/map.ts            # Content mapping to panel components
  ui/Panels.tsx             # Panel UI components for each section
  ui/Hud.tsx                # Navigation dots and breadcrumb system
  ui/ListView.tsx           # Accessible fallback list view
  lib/motionConfig.ts       # Animation durations and easing curves
  lib/accessibility.ts     # Accessibility utilities and helpers
  styles/globals.css        # Starfield background and component styles
/docs
  README.md                 # This file - architecture and setup guide
  motion-map.md             # Animation timing and easing reference
  content-map.md            # Resume data structure and panel mapping
  design-system.md          # Design tokens and style guide
/public
  resume.json               # Resume data source (JSON format)
\`\`\`

### Three.js Scene Setup

The 3D scene consists of:

1. **Scene Manager** (`SceneManager`): Handles renderer, camera, lights, and resize events
2. **Solar Objects** (`SolarObjects`): Creates sun (central sphere + glow) and 5 orbital nodes
3. **Orbit Controller** (`OrbitController`): Manages orbital positioning with mathematical precision
4. **Camera Controller** (`CameraController`): Smooth transitions between default and focused views
5. **Interaction Controller** (`InteractionController`): Handles all user input methods

### Orbital Mathematics

Nodes are positioned using polar coordinates with subtle vertical variation:

\`\`\`javascript
const angle = (index / nodeCount) * Math.PI * 2 + elapsed * 0.0005
const x = Math.cos(angle) * radius
const z = Math.sin(angle) * radius  
const y = 0.15 * Math.sin(0.6 * angle) // Vertical wobble
\`\`\`

- **Base Angle**: Evenly distributed around circle (72° apart for 5 nodes)
- **Rotation Speed**: 0.0005 radians per millisecond (very slow)
- **Radius**: 4 units from center
- **Vertical Wobble**: Sine wave creates subtle 3D depth

### Camera Tweening

Camera transitions use exponential easing for natural motion:

\`\`\`javascript
// Focus position: node position + offset
const focusPosition = nodePosition.clone().add(new Vector3(0, 1.2, 2.6))

// Exponential ease-out: 1 - (1 - t)³
const eased = 1 - Math.pow(1 - progress, 3)
camera.position.lerpVectors(startPos, focusPos, eased)
\`\`\`

**Focus Offset**: (0, 1.2, 2.6) positions camera above and behind the node for optimal viewing angle.

### Event Flow

1. **User Input** → Interaction Controller processes click/scroll/keyboard
2. **Node Selection** → Orbit Controller pauses rotation, highlights node
3. **Camera Animation** → Camera Controller smoothly transitions to focus position
4. **Panel Display** → Panel component renders with staggered content animation
5. **Close Action** → Camera returns to default, orbit resumes, highlights reset

## Content Management

### Resume Data Structure

The system accepts resume data in multiple formats:

- **JSON**: Direct structured data (recommended)
- **Markdown**: With front-matter metadata
- **PDF**: Parsed and normalized (future enhancement)

### Data Normalization

All formats are normalized to this structure:

\`\`\`typescript
interface NormalizedData {
  summary: {
    headline: string
    about: string
    links: { email: string, linkedin?: string, github?: string }
  }
  experience: Array<{
    company: string
    role: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    name: string
    summary: string
    tech: string[]
    bullets?: string[]
  }>
  skills: {
    groups: Array<{
      title: string
      items: string[]
    }>
  }
  contact: {
    email: string
    socials: Record<string, string>
  }
}
\`\`\`

### Swapping Resume Files

To update your resume content:

1. Replace `/public/resume.json` with your data
2. Follow the normalized structure above
3. The app will automatically reload content on next visit
4. No code changes required

## Accessibility Features

### Reduced Motion Support

- Automatically detects `prefers-reduced-motion: reduce`
- Disables orbital animation and camera transitions
- Switches to instant/fade transitions only
- Provides fallback list view option

### Screen Reader Support

- **ARIA Labels**: All interactive elements properly labeled
- **Live Regions**: Announces focus changes and panel state
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Focus Management**: Trapped focus in panels, logical tab order

### Keyboard Navigation

- **Arrow Keys**: Navigate between nodes (Left/Right, PageUp/PageDown)
- **Enter/Space**: Select focused node
- **Escape**: Close panel and return to overview
- **Tab**: Navigate through panel content and controls

### Fallback List View

Complete alternative interface for users who:
- Prefer reduced motion
- Use assistive technologies
- Have older browsers without WebGL support
- Experience performance issues

## Performance Optimizations

### Rendering Optimizations

- **Pixel Ratio Clamping**: `Math.min(devicePixelRatio, 2)` prevents excessive resolution
- **Efficient Lighting**: Single ambient + directional light setup
- **Billboard Optimization**: Node discs always face camera for consistent appearance
- **Animation Frame Management**: Proper cleanup prevents memory leaks

### Interaction Debouncing

- **Wheel Cooldown**: 675ms prevents multiple rapid scroll events
- **Touch Gesture Detection**: Distinguishes taps from swipes
- **Raycast Optimization**: Only checks node disc meshes for intersection

### Memory Management

- **Event Listener Cleanup**: All listeners properly removed on unmount
- **Three.js Disposal**: Geometries, materials, and renderer disposed
- **Animation Frame Cleanup**: `cancelAnimationFrame` on component unmount

## Browser Support

### Minimum Requirements

- **WebGL Support**: Required for 3D orbital view
- **ES6+ Features**: Arrow functions, async/await, destructuring
- **CSS Grid/Flexbox**: For panel layouts and responsive design
- **Modern Event APIs**: Touch events, wheel events, ResizeObserver

### Tested Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Graceful Degradation

- **No WebGL**: Automatically switches to list view
- **Older Browsers**: Fallback styles and reduced functionality
- **Slow Connections**: Progressive loading with skeleton states

## Development

### Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

### Key Dependencies

- **Next.js 15**: React framework with App Router
- **Three.js**: 3D graphics and WebGL rendering
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling system

### Environment Variables

No environment variables required for basic functionality. All configuration is handled through:

- Resume data files in `/public`
- Motion config in `/src/lib/motionConfig.ts`
- Style tokens in `/app/globals.css`

### Customization Points

1. **Colors**: Update node colors in `src/scene/objects.ts`
2. **Timing**: Modify durations in `src/lib/motionConfig.ts`
3. **Layout**: Adjust panel styles in `src/ui/Panels.tsx`
4. **Content**: Replace resume data in `/public/resume.json`

## Deployment

### Build Process

\`\`\`bash
npm run build
npm start
\`\`\`

### Static Assets

- Resume files served from `/public`
- No external CDN dependencies
- Self-contained Three.js bundle

### Performance Monitoring

Monitor these metrics in production:

- **First Contentful Paint**: Should be < 1.5s
- **WebGL Context Creation**: Success rate > 95%
- **Animation Frame Rate**: Maintain 60fps on modern devices
- **Memory Usage**: Stable over extended sessions

## Troubleshooting

### Common Issues

**Black screen on load**:
- Check browser WebGL support
- Verify resume.json is valid JSON
- Check browser console for errors

**Poor performance**:
- Reduce devicePixelRatio in scene setup
- Check for memory leaks in dev tools
- Consider disabling orbital animation

**Accessibility concerns**:
- Test with screen readers
- Verify keyboard navigation works
- Ensure sufficient color contrast

### Debug Mode

Add `?debug=true` to URL for additional logging and performance metrics.
