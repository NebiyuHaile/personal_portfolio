# Motion Map - Animation Timing and Easing Reference

This document maps all animations, transitions, and motion effects in the orbital portfolio, providing precise timing specifications and easing curves for consistent user experience.

## Core Motion Configuration

Located in `/src/lib/motionConfig.ts`:

\`\`\`typescript
export const motionConfig = {
  camera: {
    duration: 1000,    // 0.9-1.1s range
    easing: 'expo.out'
  },
  panel: {
    duration: 320,     // 280-360ms range  
    easing: 'easeOut'
  },
  content: {
    stagger: 75,       // 60-90ms range
    duration: 200
  },
  wheel: {
    cooldown: 675      // 650-700ms range
  },
  orbit: {
    speed: 0.0005,     // radians per millisecond
    wobble: 0.15       // vertical amplitude
  }
}
\`\`\`

## Animation Categories

### 1. Camera Transitions

**Effect**: Smooth movement between default view and focused node
**Duration**: 1000ms (1 second)
**Easing**: Exponential ease-out `1 - (1 - t)³`
**Trigger**: Node click, keyboard selection, scroll navigation
**Notes**: Creates natural deceleration, feels responsive but not jarring

**Implementation**:
\`\`\`javascript
// Focus transition
camera.position.lerpVectors(startPosition, focusPosition, eased)
camera.lookAt(focusTarget)

// Return transition  
camera.position.lerpVectors(startPosition, defaultPosition, eased)
camera.lookAt(defaultTarget)
\`\`\`

### 2. Panel Animations

**Effect**: Slide-in panel with backdrop blur
**Duration**: 320ms
**Easing**: Standard ease-out `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
**Trigger**: Panel open/close
**Notes**: Quick enough to feel instant, slow enough to be smooth

**CSS Implementation**:
\`\`\`css
.panel-overlay {
  transform: translateX(100%);
  transition: transform 320ms ease-out;
}

.panel-overlay.open {
  transform: translateX(0);
}
\`\`\`

### 3. Content Stagger

**Effect**: Sequential appearance of panel content elements
**Duration**: 200ms per element
**Stagger**: 75ms delay between elements
**Easing**: Standard ease-out
**Trigger**: Panel opens
**Notes**: Creates engaging reveal sequence without feeling slow

**React Implementation**:
\`\`\`jsx
<div
  className="transition-all duration-500"
  style={{ transitionDelay: `${index * 75}ms` }}
>
  {content}
</div>
\`\`\`

### 4. Orbital Motion

**Effect**: Continuous slow rotation of nodes around center
**Speed**: 0.0005 radians per millisecond
**Wobble**: 0.15 unit vertical sine wave
**Behavior**: Pauses when node is focused, resumes on close
**Notes**: Subtle movement that doesn't distract from content

**Mathematical Implementation**:
\`\`\`javascript
const elapsed = (Date.now() - startTime) * 0.0005
const angle = baseAngle + elapsed
const y = 0.15 * Math.sin(0.6 * angle)
\`\`\`

### 5. Interaction Feedback

**Effect**: Visual feedback for hover and focus states
**Duration**: 200ms
**Easing**: Standard ease-out
**Trigger**: Mouse hover, keyboard focus, touch interaction
**Notes**: Immediate feedback for better user experience

**States**:
- **Hover**: Scale 110%, increased opacity
- **Focus**: Bright glow, full opacity
- **Active**: Enhanced emissive intensity

## Reduced Motion Adaptations

When `prefers-reduced-motion: reduce` is detected:

### Disabled Animations
- Orbital rotation (static positioning)
- Camera transitions (instant cuts)
- Starfield animation (static background)
- Content stagger (simultaneous appearance)

### Preserved Interactions
- Panel slide transitions (reduced to 50ms)
- Hover state changes (instant)
- Focus indicators (immediate)

### Implementation
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  
  .starfield {
    animation: none;
  }
}
\`\`\`

## Performance Considerations

### Frame Rate Targets
- **Orbital Animation**: 60fps (16.67ms per frame)
- **Camera Transitions**: 60fps during movement
- **Panel Animations**: 60fps for smooth slide

### Optimization Techniques
- **RequestAnimationFrame**: Synced with display refresh
- **Transform-only Animations**: Avoid layout/paint triggers
- **GPU Acceleration**: Use transform3d for hardware acceleration
- **Debounced Interactions**: Prevent excessive event firing

### Memory Management
- **Animation Cleanup**: Cancel frames on component unmount
- **Event Listener Removal**: Prevent memory leaks
- **Three.js Disposal**: Clean up geometries and materials

## Timing Rationale

### Camera Duration (1000ms)
- **Too Fast** (<500ms): Jarring, motion sickness
- **Too Slow** (>1500ms): Feels sluggish, impatient users
- **Sweet Spot** (1000ms): Natural, comfortable, purposeful

### Panel Duration (320ms)
- **Too Fast** (<200ms): Abrupt, hard to follow
- **Too Slow** (>500ms): Delays content access
- **Sweet Spot** (320ms): Smooth but efficient

### Content Stagger (75ms)
- **Too Fast** (<50ms): Elements blur together
- **Too Slow** (>100ms): Feels like loading delay
- **Sweet Spot** (75ms): Clear sequence, engaging rhythm

### Wheel Cooldown (675ms)
- **Too Short** (<400ms): Accidental double-navigation
- **Too Long** (>1000ms): Unresponsive to intentional rapid scrolling
- **Sweet Spot** (675ms): Prevents accidents, allows intentional speed

## Easing Curve Details

### Exponential Ease-Out
**Formula**: `1 - (1 - t)³`
**Use Case**: Camera transitions
**Characteristics**: Fast start, gradual slow-down, natural deceleration

### Standard Ease-Out  
**Formula**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
**Use Case**: Panel slides, content reveals
**Characteristics**: Balanced acceleration/deceleration

### Linear
**Formula**: `t`
**Use Case**: Orbital rotation, loading indicators
**Characteristics**: Constant speed, mechanical precision

## Testing Motion

### Manual Testing Checklist
- [ ] Camera transitions feel smooth and natural
- [ ] Panel animations don't feel sluggish
- [ ] Content stagger creates pleasant reveal
- [ ] Orbital motion is subtle, not distracting
- [ ] Reduced motion preferences are respected
- [ ] No animation conflicts or overlaps

### Performance Testing
- [ ] Maintain 60fps during all animations
- [ ] No memory leaks after repeated interactions
- [ ] Smooth performance on mobile devices
- [ ] Graceful degradation on slower hardware

### Accessibility Testing
- [ ] Reduced motion disables problematic animations
- [ ] Focus indicators are clearly visible
- [ ] Screen readers announce state changes appropriately
- [ ] Keyboard navigation timing feels natural
