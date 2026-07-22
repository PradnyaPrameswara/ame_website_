# Ashley Brooke Implementation Plan

## Current Project Assessment
- **Framework:** Astro 7.0.7
- **Styling:** Vanilla CSS (`globals.css`)
- **Animation Stack:** GSAP 3.15, Lenis 1.3
- **Routing:** Astro standard routing
- **Status:** Existing boilerplate/scaffold components are present but need to be aligned with the extracted layout blueprint from the reference site. The project is safe to modify as existing changes are isolated to the components in `src/components/sections`.

## Proposed Route
The implementation will focus on updating the root `index.astro` and the individual components nested within `src/components/sections/` to reflect the extracted layout memory, ensuring original assets, original naming, and non-infringing structural adaptation are used.

## Proposed Component Tree
```jsx
<BaseLayout>
  <SiteHeader />
  <main>
    <HeroSection />
    <ChapterTransition number="01" label="..." />
    <StoryPoster />
    <StoryStatements />
    <OperationsSequence />
    <ChapterTransition number="02" label="..." />
    <ClientShowcase />
    <ChapterTransition number="03" label="..." />
    <CapabilitiesSection />
    <ServicesIntro />
    <ServicesStack />
    <ClosingSection />
  </main>
  <SiteFooter />
</BaseLayout>
```

## Existing Components to Preserve
- `BaseLayout.astro`: Keep the core HTML shell.
- `SiteHeader.astro` & `SiteFooter.astro`: Preserve basic navigation structure.
- Fonts and Base CSS in `globals.css`: Keep the styling system intact, only modifying layout behaviors (flex/grid/sticky).

## Expected Files to Modify
- `src/components/sections/*.astro`: All existing placeholder sections will be updated to match the responsive behaviors, DOM patterns, and sticky rules defined in `docs/agents/ashley-brooke-layout-memory.md`.
- `src/pages/index.astro`: Ensure the component composition matches the blueprint.
- `src/styles/globals.css`: Add structural classes for grids, padding scales, and sticky positioning inferred from the reference layout.

## Expected Files to Create
- We do not expect to create new files as the scaffolding in `src/components/sections` already perfectly maps to our intended blueprint.

## Animation Architecture
- GSAP ScrollTrigger will handle sticky behaviors (if not native CSS) and scrubbed scroll interactions.
- Native CSS transitions for hover states on Services cards and Header links.
- Lenis handles the global smooth scroll.

## Responsive Strategy
- **Desktop:** Enable complex sticky layouts and ScrollTrigger scrub animations. Max-width constraints on `.container`.
- **Tablet/Mobile:** Use CSS media queries to stack elements (`flex-direction: column`) and convert sticky positioning to static flow where vertical real-estate is limited.
- **Breakpoints:** `47.99rem` (mobile), `64rem` (tablet).

## Accessibility Strategy
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`).
- Ensure focus states (`:focus-visible`) are prominent.
- Disable complex GSAP animations when `@media (prefers-reduced-motion: reduce)` is true.

## Performance Considerations
- Lazy-load below-the-fold images (`loading="lazy"`).
- Use CSS transforms (`translate3d` / `transform`) and `opacity` exclusively for animations to prevent layout thrashing.
- Clean up GSAP timelines/ScrollTriggers in `onDestroy` or cleanup blocks.

## Test Strategy
- Run `npm run check` (Astro typecheck).
- Run existing Visual QA tests via `node qa/visual-qa.mjs` (if appropriate).
- Validate cross-viewport rendering via local manual dev server inspection.

## Known Risks
- Balancing sticky layout CSS cross-browser (Safari quirks with `position: sticky` and overflow).
- Scrolling jank if too many GSAP ScrollTriggers calculate concurrently.

## Implementation Sequence
1. Update `globals.css` with layout utility classes.
2. Reconstruct `SiteHeader` and `SiteFooter` structures.
3. Reconstruct `HeroSection`.
4. Reconstruct scrolling/editorial sections (`StoryPoster`, `OperationsSequence`, `CapabilitiesSection`).
5. Wire up GSAP animations per section.
6. QA against screenshots and run tests.
