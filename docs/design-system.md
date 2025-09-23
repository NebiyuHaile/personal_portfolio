# Design System - Tokens, Components, and Style Guide

This document defines the visual design system for the orbital portfolio, including color palettes, typography scales, spacing systems, and component specifications.

## Design Philosophy

**Neat, Stylized, 2.5D Aesthetic**: Clean geometric forms with subtle depth and sophisticated interactions. The design balances futuristic orbital mechanics with professional portfolio presentation.

**Accessibility First**: All design decisions prioritize WCAG AA compliance, ensuring the portfolio is usable by everyone regardless of ability or technology.

**Performance Conscious**: Visual effects are optimized for smooth 60fps performance across devices while maintaining visual appeal.

## Color System

### Primary Palette (5 Colors Total)

**Background**: Pure black `#000000`
- Usage: Canvas background, deep space aesthetic
- Contrast: Provides maximum contrast for colored elements

**Foreground**: White `#ffffff` and variants
- Primary text: `rgba(255, 255, 255, 0.9)`
- Secondary text: `rgba(255, 255, 255, 0.7)`
- Tertiary text: `rgba(255, 255, 255, 0.6)`

**Node Colors** (5 distinct hues):
1. **Introduction**: Light Blue `#64b5f6`
2. **Experience**: Light Green `#81c784`  
3. **Projects**: Orange `#ffb74d`
4. **Skills**: Pink `#f06292`
5. **Contact**: Purple `#9575cd`

**Accent Colors**:
- **Sun/Central**: Gold `#ffd700`
- **Interactive States**: White with opacity variations

### Color Usage Rules

**Text Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
**Interactive Elements**: Hover states use 20% opacity increase
**Focus Indicators**: 2px solid `#60a5fa` outline with 2px offset
**Disabled States**: 40% opacity reduction

### High Contrast Mode Support

\`\`\`css
@media (prefers-contrast: high) {
  .panel-overlay {
    background: rgba(0, 0, 0, 0.95);
    border-left: 2px solid white;
  }
  
  .hud-nav button {
    border-width: 3px;
  }
}
\`\`\`

## Typography System

### Font Families (Maximum 2)

**Primary**: Geist Sans (Headings and UI)
- Usage: All headings, buttons, navigation, labels
- Weights: 400 (regular), 600 (semibold), 700 (bold)
- Characteristics: Modern, clean, excellent readability

**Secondary**: Geist Sans (Body Text)
- Usage: Paragraphs, descriptions, content
- Weight: 400 (regular)
- Line Height: 1.6 (leading-relaxed)

### Type Scale

**Scale Ratio**: 1.25 (Major Third)
**Base Size**: 16px (1rem)

\`\`\`css
.text-sm    { font-size: 14px; }  /* 0.875rem */
.text-base  { font-size: 16px; }  /* 1rem */
.text-lg    { font-size: 18px; }  /* 1.125rem */
.text-xl    { font-size: 20px; }  /* 1.25rem */
.text-2xl   { font-size: 24px; }  /* 1.5rem */
.text-3xl   { font-size: 30px; }  /* 1.875rem */
.text-4xl   { font-size: 36px; }  /* 2.25rem */
\`\`\`

### Typography Rules

**Line Height**: 1.4-1.6 for body text (use `leading-relaxed`)
**Line Length**: 45-75 characters optimal (use `text-balance`, `text-pretty`)
**Hierarchy**: Clear distinction between heading levels
**Responsive**: Smaller sizes on mobile, larger on desktop

## Spacing System

### 8-Point Grid System

All spacing uses multiples of 8px for consistent rhythm:

\`\`\`css
.space-1  { margin: 4px; }   /* 0.25rem */
.space-2  { margin: 8px; }   /* 0.5rem */
.space-3  { margin: 12px; }  /* 0.75rem */
.space-4  { margin: 16px; }  /* 1rem */
.space-6  { margin: 24px; }  /* 1.5rem */
.space-8  { margin: 32px; }  /* 2rem */
.space-12 { margin: 48px; }  /* 3rem */
.space-16 { margin: 64px; }  /* 4rem */
\`\`\`

### Layout Spacing

**Component Gaps**: 16px (space-4) default
**Section Spacing**: 32px (space-8) between major sections
**Panel Padding**: 32px (space-8) on all sides
**Content Margins**: 24px (space-6) between content blocks

## Layout System

### 12-Column Overlay Grid

**Desktop**: 12 columns with 24px gutters
**Tablet**: 8 columns with 20px gutters  
**Mobile**: 4 columns with 16px gutters

**Max Width**: 1200px centered
**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Method Priority

1. **Flexbox** (Primary): Most layouts use flex
   \`\`\`css
   .flex { display: flex; }
   .items-center { align-items: center; }
   .justify-between { justify-content: space-between; }
   \`\`\`

2. **CSS Grid** (Secondary): Complex 2D layouts only
   \`\`\`css
   .grid { display: grid; }
   .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
   .gap-4 { gap: 1rem; }
   \`\`\`

3. **Avoid**: Floats, absolute positioning (except for overlays)

## Component Specifications

### Orbital Nodes

**Size**: 0.8 unit diameter (0.4 radius)
**Glow**: 1.0 unit diameter outer glow at 20% opacity
**Ring**: 1.0-1.04 unit ring at 30% opacity
**Labels**: 2x0.5 unit sprites, positioned 0.8 units below node

**Hover State**:
- Scale: 110%
- Emissive Intensity: 0.3
- Transition: 200ms ease-out

**Focus State**:
- Emissive Intensity: 0.3
- Opacity: 100%
- Ring Opacity: 50%

### Panels

**Desktop Dimensions**: 420px width, 100vh height
**Mobile Dimensions**: 100vw width, 100vh height
**Background**: `rgba(0, 0, 0, 0.9)` with 10px blur
**Border**: 1px solid `rgba(255, 255, 255, 0.1)`
**Animation**: 320ms ease-out slide transition

**Content Spacing**:
- Header: 32px bottom margin
- Sections: 32px vertical spacing
- Items: 24px vertical spacing
- Text blocks: 16px vertical spacing

### HUD Navigation

**Dot Size**: 12px diameter
**Spacing**: 12px vertical gaps
**Position**: Fixed right, vertically centered
**States**:
- Default: Transparent with 50% opacity border
- Hover: 80% opacity border, 105% scale
- Active: Solid white with shadow

### Buttons and Interactive Elements

**Primary Buttons**:
- Padding: 12px 16px
- Border Radius: 8px
- Background: `rgba(255, 255, 255, 0.1)`
- Hover: `rgba(255, 255, 255, 0.2)`
- Transition: 200ms ease-out

**Link Cards**:
- Padding: 16px
- Border Radius: 12px
- Border: 1px solid `rgba(255, 255, 255, 0.1)`
- Hover: Background `rgba(255, 255, 255, 0.1)`

## Border Radius System

**Consistent Radii**:
- Small: 8px (buttons, tags)
- Medium: 12px (cards, panels)
- Large: 16px (major containers)
- Full: 9999px (pills, dots)

## Shadow System

**Subtle Shadows** (minimal usage):
- Focus: `0 0 0 2px rgba(96, 165, 250, 0.5)`
- Active Node: `0 0 20px rgba(255, 255, 255, 0.5)`
- Panel: `0 25px 50px rgba(0, 0, 0, 0.5)`

## Animation Specifications

### Transition Durations

**Micro-interactions**: 200ms
- Hover states, focus changes, small transforms

**Component Transitions**: 320ms  
- Panel slides, modal appearances

**Layout Changes**: 500ms
- Content reveals, major state changes

**Camera Movements**: 1000ms
- Orbital navigation, focus transitions

### Easing Curves

**Standard**: `ease-out` for most UI transitions
**Exponential**: `cubic-bezier(0.16, 1, 0.3, 1)` for camera movement
**Bounce**: Avoided (not suitable for professional context)

## Responsive Design

### Mobile Adaptations

**Typography**: Reduce scale by 10-15%
**Spacing**: Reduce margins by 25%
**Touch Targets**: Minimum 44px tap areas
**Panel**: Full-screen overlay instead of sidebar

### Tablet Adaptations

**Grid**: 8-column layout
**Typography**: Maintain desktop sizes
**Interactions**: Support both touch and mouse

### Desktop Enhancements

**Hover States**: Rich interactive feedback
**Keyboard Navigation**: Full keyboard support
**Multi-column**: Utilize horizontal space effectively

## Accessibility Specifications

### Focus Management

**Focus Indicators**: 2px solid blue outline, 2px offset
**Focus Trap**: Contained within open panels
**Tab Order**: Logical sequence through interactive elements

### Screen Reader Support

**ARIA Labels**: All interactive elements labeled
**Live Regions**: State changes announced
**Semantic HTML**: Proper heading hierarchy

### Reduced Motion

**Disable**: Orbital animation, camera transitions, starfield
**Preserve**: Panel slides (reduced duration), focus indicators
**Alternative**: Automatic list view fallback

## Quality Assurance Checklist

### Visual Consistency
- [ ] All colors from approved palette
- [ ] Typography follows scale and hierarchy
- [ ] Spacing uses 8-point grid system
- [ ] Border radii consistent across components

### Accessibility Compliance
- [ ] WCAG AA contrast ratios met
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility tested
- [ ] Reduced motion preferences respected

### Performance Standards
- [ ] 60fps animation performance
- [ ] No layout thrashing during transitions
- [ ] Efficient CSS (no redundant rules)
- [ ] Optimized asset loading

### Cross-browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (WebKit)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Verification
- [ ] Mobile portrait/landscape
- [ ] Tablet portrait/landscape  
- [ ] Desktop standard/wide
- [ ] Touch and mouse interactions

## Design Token Implementation

### CSS Custom Properties

\`\`\`css
:root {
  /* Colors */
  --color-background: #000000;
  --color-foreground: #ffffff;
  --color-node-intro: #64b5f6;
  --color-node-experience: #81c784;
  --color-node-projects: #ffb74d;
  --color-node-skills: #f06292;
  --color-node-contact: #9575cd;
  
  /* Typography */
  --font-family-primary: 'Geist Sans', sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  /* Spacing */
  --space-unit: 8px;
  --space-xs: calc(var(--space-unit) * 0.5);
  --space-sm: var(--space-unit);
  --space-md: calc(var(--space-unit) * 2);
  --space-lg: calc(var(--space-unit) * 4);
  
  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* Timing */
  --duration-fast: 200ms;
  --duration-medium: 320ms;
  --duration-slow: 1000ms;
}
\`\`\`

This design system ensures visual consistency, accessibility compliance, and maintainable code across the entire orbital portfolio application.
