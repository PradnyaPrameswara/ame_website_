# Ashley Brooke Layout Memory

Canonical specification:

`docs/agents/ashley-brooke-layout-memory.md`

Before modifying the reference-inspired homepage:

1. Read the canonical layout memory.
2. Preserve the recorded structure, responsive behavior, and animation IDs.
3. Use AME-owned content and assets.
4. Do not copy proprietary source code, branding, media, text, or font files.
5. Update the canonical memory whenever implementation decisions change.
# Ashley Brooke Layout Memory

Canonical specification:
`docs/agents/ashley-brooke-layout-memory.md`

Before changing the reference-inspired page:
1. Read the canonical specification.
2. Preserve recorded responsive and animation behavior.
3. Update the specification when implementation decisions change.
4. Do not copy protected content or source code from the reference site.

## Implemented Redesigns

### Hero Section Redesign (2026-07-21)
- **Files Responsible**: `src/components/sections/HeroSection.astro`, `src/components/layout/SiteHeader.astro`.
- **Selected Font Families**: Archivo Variable (sans-serif) used exclusively for both wordmark and copy.
- **Final Responsive Type Scale**: Fluid clamp() typography (`clamp(4rem, 16vw, 24rem)` for the wordmark).
- **Final Hero Grid Structure**: `display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); grid-template-rows: auto 1fr auto;`.
- **Final Positioning Rules**: 100svh height, constrained by `--page-gutter`, with explicit placement using grid-column and grid-row.
- **Final Desktop and Mobile Behavior**: Desktop is a two-column grid. Mobile (max-width: 63.99rem) stack into a single column (`flex-direction: column`).
- **Intentional Deviations**: Used AME branding, color, and sans-serif (instead of serif) to retain project identity. Desktop top navigation inside hero, hiding SiteHeader toggle.
- **Animation Implementation**: Re-wired existing `animations.ts` (GSAP timeline) by placing `data-hero-wordmark`, `data-nav-link`, `data-hero-line`, and `data-hero-copy` attributes in the new DOM. No new `useEffect` was needed.
