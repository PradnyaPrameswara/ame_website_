# Ashley Brooke Layout and Animation Memory

## Purpose and restrictions
- Canonical memory for reference-inspired homepage layout, DOM hierarchy, responsive behavior, and motion patterns.
- Source site: https://www.ashleybrookecs.com/
- Not permission to copy proprietary source code, written content, media, fonts, branding, analytics, or tracking.
- Use AME-owned content, assets, and routes only.

## Reference metadata
- Source URL: https://www.ashleybrookecs.com/
- Inspected route: home (/)
- Inspection date: 2026-07-21
- Tools: real browser, DOM snapshot, screenshot QA, Playwright resource inspection, computed-style checks.
- Inspected viewports: 1920x1080, 1440x900, 1280x800, 1024x768, 768x1024, 430x932, 390x844, 375x667.
- Zoom checks: 125%, 100%, 80%, 67%, 50%.
- Confidence: high for hierarchy and composition, medium for exact scroll timings and zoom-specific line breaks.

## Page architecture
```text
<PageShell>
  <TopNav />
  <HeroSection />
  <ChapterOneIntro />
  <ChapterOneStory />
  <StoryStatements />
  <OperationsSequence />
  <ChapterNavigation />
  <TrustSection />
  <ClientShowcase />
  <CapabilitiesSection />
  <ServicesIntro />
  <ServicesSection />
  <ClosingManifesto />
  <ClosingCTA />
  <SiteFooter />
</PageShell>
```

## Global layout system
- Layout style: editorial, full-viewport, large whitespace, wide asymmetric grid.
- Shell: centered outer container with strong gutters; not a narrow centered canvas.
- Container behavior: full-width sections with centered inner content; narrow widths only for reading blocks.
- Gutter: approx `clamp(1.5rem, 2.6vw, 3rem)`; adapted for current project if needed.
- Page width: desktop content spans most of viewport; main compositions commonly approach full width.
- Section heights: many sections use `100svh` or taller scroll regions for pinning and progress.
- Backgrounds: mostly white with black or red editorial accents.
- Z-order: fixed nav above content; hero media below hero text; chapter story layers stacked explicitly.

## Hero specification
- Semantic purpose: first impression, brand identity, route navigation, and concise positioning statement.
- DOM hierarchy: wordmark block left, brand labels under wordmark, horizontal nav upper-right, large statement right-center, support copy lower-left, compact CTA lower-right.
- Container: wide centered inner wrapper with no tiny canvas scaling.
- Grid: two-column editorial grid on desktop; stacked flow on mobile.
- Widths: wordmark dominates upper-left at roughly 38% to 42% of viewport width; statement block roughly 34% to 40% of viewport on desktop.
- Typography: oversized AME wordmark, bold modern sans nav, medium-heavy statement, readable support copy.
- Behavior: on desktop, statically composed with large whitespace; on mobile, stacked semantic order.
- Current-project mapping: confirmed -> `src/components/sections/HeroSection.astro`.

## Chapter 01 specification
- Semantic purpose: numbered narrative intro and first scroll-progress story block.
- DOM hierarchy: intro banner, outer scroll region, sticky stage, four-image panel, duplicate headline layers, supporting narrative copy.
- Layout rules:
  - outer progress region provides scroll distance;
  - sticky inner stage holds centered composition;
  - active black layer is `position: absolute; inset: 0`;
  - pale base layer is `position: relative` and establishes geometry;
  - images sit between base and active text;
  - black layer clips from `inset(0 0 100% 0)` to `inset(0 0 0% 0)`.
- Layer order: active black clipped text, images, pale base text, background.
- Text behavior: both layers render from the same headline string array; only one semantic heading is exposed to assistive tech; duplicate base layer is `aria-hidden="true"`.
- Image layout: four compact landscape or near-landscape images in zig-zag left-right placement; images frame text, not wall it off.
- Motion: black reveal tracks scroll progress downward and reverses upward; image parallax is per-image, not index-based.
- Reduced motion: final readable state only; no GSAP scroll reveal.
- Mobile: remove complex overlap; preserve readable order and simpler flow.
- Current-project mapping: confirmed -> `src/components/sections/StoryPoster.astro`, `src/scripts/site/animations.ts`.

## Chapter 02 specification
- Semantic purpose: trust / client proof section, editorial chapter transition, large project showcase.
- DOM hierarchy: chapter banner, trust heading, supporting copy, client list, preview figure area.
- Layout: large title-and-preview composition, not card grid; desktop uses strong asymmetry and sticky rhythm.
- Behavior: section transition and showcase movement are scroll-controlled; focus remains on names and imagery.
- Current-project mapping: confirmed -> `src/components/sections/ChapterTransition.astro`, `src/components/sections/ClientShowcase.astro`.

## Chapter 03 specification
- Semantic purpose: multilingual / creative-language sequence and conceptual language shift.
- DOM hierarchy: label block, oversized rotating or staged words, support copy, CTA.
- Layout: generous vertical spacing, large typography, controlled sequence inside a sticky or progress-driven stage.
- Current-project mapping: confirmed -> `src/components/sections/CapabilitiesSection.astro`.

## Services specification
- Semantic purpose: service offerings presented as editorial rows or large cards with strong hierarchy.
- DOM hierarchy: intro, title, row/card list, keywords, hover or scroll affordance.
- Layout: full available width on desktop, simplified vertical flow on mobile.
- Behavior: hover states can remain CSS-driven; scroll animation only where it adds clear hierarchy.
- Current-project mapping: confirmed -> `src/components/sections/ServicesIntro.astro`, `src/components/sections/ServicesStack.astro`.

## Closing and footer specification
- Semantic purpose: closing manifesto, final CTA, and footer navigation/inquiry details.
- DOM hierarchy: manifesto headline, supporting copy, strong CTA, footer with nav and contact details.
- Layout: large editorial spacing and strong terminal weight; footer should not feel detached or small.
- Current-project mapping: confirmed -> `src/components/sections/ClosingSection.astro`, `src/components/layout/SiteFooter.astro`.

## Responsive matrix
- Desktop: preserve asymmetric grid, large wordmark, right-aligned nav, right-side statement, lower-left support copy, lower-right CTA.
- Tablet: reduce wordmark scale, keep two columns where possible, allow limited nav wrapping, widen statement within its column.
- Mobile: switch to normal document flow, stack wordmark, brand labels, nav, statement, support copy, CTA; remove overlap and pinning.
- Reference behavior: sticky sections soften or collapse on smaller breakpoints; layout remains readable before decorative motion.

## Typography system
- Hero wordmark: very large display-scale uppercase, tightly tracked, accent color.
- Navigation: bold modern sans, single-line horizontal row on desktop, readable at top-right.
- Statements: medium-heavy grotesk, tight line-height, negative letter spacing, broad multiline blocks rather than narrow stacked columns.
- Section copy: medium-weight sans with restrained line length.
- Chapter 01 headline: approx 76px to 84px on desktop, line-height roughly 0.88 to 0.92, uppercase, centered.
- Reference fonts observed from network: Mosvita and Universo. Treat as proprietary and do not reuse; use legal alternatives in the current project.

## Image-placement registry
- Hero media trail: floating / layered decorative images behind hero copy.
- Chapter 01 story set: four compact asymmetric images, near-landscape, left-right zig-zag.
- Client showcase: large preview images tied to selection state.
- All image motion: preserve aspect ratio; avoid width/height animation that distorts composition.

## Animation registry
- ANIM-001 — hero entrance
  - trigger: initial load
  - targets: wordmark, nav, statement, support copy, CTA
  - initial: translated / hidden
  - final: settled, visible
  - implementation: GSAP timeline + transform + opacity
  - reduced motion: show final state without entrance animation
- ANIM-002 — navigation reveal
  - trigger: load / initial mount
  - targets: top nav items
  - implementation: GSAP stagger or CSS transition
  - reduced motion: static visible nav
- ANIM-003 — chapter banner entrance
  - trigger: scroll enter
  - targets: chapter intro banner and number
  - implementation: sticky or GSAP scroll reveal
- ANIM-004 — Chapter 01 black text scroll reveal
  - trigger: scroll progress through dedicated outer region
  - targets: active black headline layer
  - initial: `clip-path: inset(0 0 100% 0)`
  - final: `clip-path: inset(0 0 0% 0)`
  - implementation: GSAP ScrollTrigger + clip-path
  - reverse scroll: restores pale base layer visibility
  - reduced motion: final revealed state
- ANIM-005 — Chapter 01 image parallax
  - trigger: scroll progress
  - targets: four image panels
  - implementation: per-image GSAP ScrollTrigger with distinct motion values
  - reverse scroll: motion reverses cleanly
  - reduced motion: no parallax
- ANIM-006 — story statement reveal
  - trigger: scroll enter
  - targets: supporting story copy blocks
  - implementation: scroll-triggered transform / opacity
- ANIM-007 — operational word sequence
  - trigger: scroll progress
  - targets: word sequence in operations section
  - implementation: ScrollTrigger scrub or staged CSS/GSAP sequence
- ANIM-008 — chapter transition
  - trigger: scroll progress across chapter separator
  - targets: chapter label and number
  - implementation: sticky or ScrollTrigger-based transition
- ANIM-009 — client showcase movement
  - trigger: hover / selection / scroll context
  - targets: list buttons and preview image
  - implementation: CSS hover states plus GSAP image swap, if used
- ANIM-010 — multilingual word sequence
  - trigger: scroll enter / progress
  - targets: rotating or sequential language words
  - implementation: GSAP timeline or CSS-driven staged reveal
- ANIM-011 — services interaction
  - trigger: hover / scroll
  - targets: service rows or cards
  - implementation: CSS transitions preferred; scroll animation only if needed
- ANIM-012 — closing manifesto reveal
  - trigger: scroll enter
  - targets: manifesto headline and CTA
  - implementation: ScrollTrigger reveal or sticky hold
- ANIM-013 — footer entrance
  - trigger: scroll enter near page end
  - targets: footer content blocks
  - implementation: simple reveal or no motion if motion budget is exhausted

## Z-index system
- Global nav and mobile menu above all content.
- Hero media trail below hero content.
- Chapter 01 layering: active black text above images above pale base text.
- Fixed overlays and transitions should remain above pinned sections.

## GSAP and cleanup rules
- Use `gsap.context()` scoped to each section or interaction cluster.
- Cleanup must call `context.revert()`.
- ScrollTrigger instances must not duplicate on hot reload.
- Refresh after layout measurements settle, but do not rely on refresh alone for broken distances.
- Recompute trigger start/end after section heights change.

## Reduced-motion rules
- Skip GSAP setup entirely when `prefers-reduced-motion: reduce` is active.
- Show final readable composition without clip-path scrub or parallax.
- Replace pinned/sticky complexity with normal document flow where needed.
- Preserve navigation and accessible focus states.

## Current-project component mapping
- Reference hero -> `src/components/sections/HeroSection.astro` (confirmed)
- Reference Chapter 01 -> `src/components/sections/StoryPoster.astro` + `src/scripts/site/animations.ts` (confirmed)
- Reference story statements -> `src/components/sections/StoryStatements.astro` (confirmed)
- Reference operations sequence -> `src/components/sections/OperationsSequence.astro` (confirmed)
- Reference chapter transition -> `src/components/sections/ChapterTransition.astro` (confirmed)
- Reference clients -> `src/components/sections/ClientShowcase.astro` (confirmed)
- Reference multilingual sequence -> `src/components/sections/CapabilitiesSection.astro` (confirmed)
- Reference services -> `src/components/sections/ServicesIntro.astro` + `src/components/sections/ServicesStack.astro` (confirmed)
- Reference closing -> `src/components/sections/ClosingSection.astro` (confirmed)
- Reference footer -> `src/components/layout/SiteFooter.astro` (confirmed)

## Known uncertainties
- Exact ScrollTrigger start/end values are approximated from observed motion.
- Exact 125% zoom behavior was not exhaustively scripted; treat zoom notes as approximated.
- Some typography and line breaks vary by browser font rendering and viewport width.
- Exact motion curves from the reference are not reused; use current project easing standards.

## Intentional deviations
- AME branding, copy, routes, and assets stay in place.
- Legal font alternatives replace proprietary reference fonts.
- No proprietary HTML, source code, analytics, or media copied.
- Motion can be recreated with current Astro + GSAP architecture instead of the reference implementation.

## Change log
- 2026-07-21: Canonical layout memory expanded from live reference inspection and existing project mapping.

