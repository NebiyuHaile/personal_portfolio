# Content Map - Resume Data Structure and Panel Mapping

This document details how resume data flows from source files through normalization to panel display, including field mappings and content transformation rules.

## Data Flow Overview

\`\`\`
Resume Source → Loader → Normalizer → Content Mapper → Panel Components
     ↓              ↓          ↓             ↓              ↓
resume.json → loadResumeData() → normalizeData() → mapContentToPanels() → Panel UI
\`\`\`

## Source Data Formats

### JSON Format (Recommended)

**File**: `/public/resume.json`
**Advantages**: Direct mapping, no parsing overhead, type-safe
**Structure**: Matches normalized format exactly

\`\`\`json
{
  "summary": {
    "headline": "Software Engineer & Data Science Researcher",
    "about": "Computer Science student with experience in...",
    "links": {
      "email": "nebiyu.haile@mnsu.edu",
      "phone": "(507)-469-4078",
      "linkedin": "https://linkedin.com/in/nebiyuhaile",
      "github": "https://github.com/NebiyuHaile"
    }
  },
  "experience": [...],
  "projects": [...],
  "skills": {...},
  "contact": {...}
}
\`\`\`

### Markdown Format (Future)

**File**: `/public/resume.md`
**Advantages**: Human-readable, version control friendly
**Structure**: Front-matter + structured content

\`\`\`markdown
---
headline: "Software Engineer & Data Science Researcher"
email: "nebiyu.haile@mnsu.edu"
---

# Experience

## Software Engineer Intern
**Student Government @ Minnesota State University** | Jan 2025 – May 2025

- Developed full-stack web application...
\`\`\`

### PDF Format (Future)

**File**: `/public/resume.pdf`
**Advantages**: Standard format, existing documents
**Challenges**: Parsing complexity, layout extraction
**Implementation**: OCR + NLP processing pipeline

## Normalized Data Structure

All source formats are converted to this TypeScript interface:

\`\`\`typescript
interface NormalizedData {
  summary: {
    headline: string           // Main professional title
    about: string             // Brief professional summary
    links: {
      email: string           // Primary contact email
      phone?: string          // Phone number (optional)
      linkedin?: string       // LinkedIn profile URL
      github?: string         // GitHub profile URL
      [key: string]: string  // Additional social links
    }
  }
  
  experience: Array<{
    company: string           // Organization name
    role: string             // Job title/position
    period: string           // Date range (e.g., "Jan 2025 – May 2025")
    location?: string        // City, State/Country
    bullets: string[]        // Achievement/responsibility bullets
    links: Record<string, string>  // Related links (optional)
  }>
  
  projects: Array<{
    name: string             // Project title
    summary: string          // Brief description
    period?: string          // Development timeframe
    tech: string[]           // Technologies used
    bullets?: string[]       // Additional details
    links: Record<string, string>  // Demo, repo, etc.
  }>
  
  skills: {
    groups: Array<{
      title: string          // Category name (e.g., "Languages")
      items: string[]        // Individual skills
    }>
  }
  
  contact: {
    email: string            // Primary email
    phone?: string           // Phone number
    socials: Record<string, string>  // Social media profiles
  }
}
\`\`\`

## Panel Content Mapping

### Introduction Panel

**Source Fields**:
- `summary.headline` → Main heading
- `summary.about` → Description paragraph
- `summary.links` → Contact buttons

**UI Components**:
- Hero headline with blue accent color
- Paragraph text with readable line height
- Action buttons for email, LinkedIn, GitHub
- Responsive button layout (flex-wrap)

**Styling**:
\`\`\`css
.headline { color: #64b5f6; font-size: 2xl; }
.about { line-height: 1.6; color: white/90; }
.links { display: flex; gap: 1rem; flex-wrap: wrap; }
\`\`\`

### Experience Panel

**Source Fields**:
- `experience[]` → Timeline entries
- Each entry: `role`, `company`, `period`, `location`, `bullets`

**UI Components**:
- Vertical timeline with left border
- Role as primary heading (blue accent)
- Company and location as secondary info
- Bullet points with custom markers
- Chronological order (most recent first)

**Content Processing**:
\`\`\`javascript
// Sort by period (most recent first)
const sortedExperience = experience.sort((a, b) => 
  new Date(b.period.split('–')[0]) - new Date(a.period.split('–')[0])
)
\`\`\`

### Projects Panel

**Source Fields**:
- `projects[]` → Project cards
- Each entry: `name`, `summary`, `tech`, `bullets`, `period`

**UI Components**:
- Card-based layout with hover effects
- Project name as heading (green accent)
- Technology tags with rounded styling
- Optional bullet points for details
- Responsive grid layout

**Technology Tags**:
\`\`\`css
.tech-tag {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}
\`\`\`

### Skills Panel

**Source Fields**:
- `skills.groups[]` → Skill categories
- Each group: `title`, `items[]`

**UI Components**:
- Category sections with orange accent headers
- Grid layout for skill items
- Hover effects on individual skills
- Responsive column count (2-4 columns)

**Grid Responsive Breakpoints**:
- Mobile: 2 columns
- Tablet: 3 columns  
- Desktop: 4 columns

### Contact Panel

**Source Fields**:
- `contact.email` → Primary email link
- `contact.phone` → Phone number link
- `contact.socials` → Social media links

**UI Components**:
- Large contact cards with icons
- Social media grid
- Purple accent theme
- Click-to-action functionality (mailto:, tel:)

**Icon Mapping**:
\`\`\`javascript
const iconMap = {
  email: '📧',
  phone: '📱', 
  linkedin: '💼',
  github: '🔗',
  default: '🌐'
}
\`\`\`

## Content Transformation Rules

### Text Processing

**Line Length**: Optimal 45-75 characters per line
**Implementation**: Use `text-balance` and `text-pretty` classes

**Bullet Points**: Convert plain text to semantic lists
**Markers**: Custom colored bullets (●) instead of default

**Links**: Auto-detect URLs and email addresses
**Security**: All external links get `rel="noopener noreferrer"`

### Date Formatting

**Input Formats**:
- "Jan 2025 – May 2025"
- "2024-08 to 2024-12"
- "August 2024 - December 2024"

**Output Format**: Consistent "MMM YYYY – MMM YYYY" style
**Present Tense**: "Present" for ongoing positions

### Technology Tags

**Normalization**: Consistent casing and naming
- "javascript" → "JavaScript"
- "reactjs" → "React"
- "nodejs" → "Node.js"

**Grouping**: Related technologies clustered together
**Color Coding**: Consistent colors per technology type

## Validation Rules

### Required Fields

**Summary**: `headline` and `about` must be non-empty
**Experience**: Each entry needs `company`, `role`, `period`
**Projects**: Each entry needs `name`, `summary`, `tech[]`
**Contact**: Must have at least `email`

### Optional Fields

**All `links` objects**: Can be empty or omitted
**Location fields**: Optional for remote work
**Phone numbers**: Not required for privacy

### Data Limits

**Text Fields**: 
- Headlines: 100 characters max
- Summaries: 500 characters max
- Bullets: 200 characters max

**Array Limits**:
- Experience: 10 entries max
- Projects: 15 entries max
- Skills per group: 20 items max

## Error Handling

### Missing Data

**Graceful Degradation**: Show available sections only
**Default Values**: Provide sensible fallbacks
**User Feedback**: Clear error messages for invalid data

### Malformed JSON

**Validation**: JSON schema validation on load
**Recovery**: Attempt partial parsing
**Fallback**: Show error state with contact info

### Network Issues

**Retry Logic**: Attempt reload 3 times
**Offline Support**: Cache last successful load
**User Experience**: Loading states and error boundaries

## Content Updates

### Hot Reloading

**Development**: Automatic reload on file changes
**Production**: Manual refresh required

### Version Control

**Git Tracking**: Resume data in version control
**Change History**: Track content evolution
**Rollback**: Easy revert to previous versions

### Content Management

**Direct Editing**: Modify JSON files directly
**Future Enhancement**: Admin interface for non-technical updates
**Validation**: Pre-commit hooks for data validation

## Localization Support (Future)

### Multi-language Structure

\`\`\`json
{
  "locale": "en-US",
  "translations": {
    "en": { "summary": {...} },
    "es": { "summary": {...} }
  }
}
\`\`\`

### Implementation Plan

**Language Detection**: Browser preference + manual override
**Content Switching**: Dynamic panel re-rendering
**URL Structure**: `/en/portfolio`, `/es/portfolio`
