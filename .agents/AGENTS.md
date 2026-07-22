# Global Agent Rules

## PROJECT DEVELOPMENT RULES

This web project must be developed using the following core stack:
- Astro.js
- React
- TypeScript

These technologies are mandatory and must remain the primary architecture of the project.

### 1. CORE TECHNOLOGY REQUIREMENTS
Use Astro for routing, page composition, static rendering, server rendering where needed, layouts, content delivery, and island architecture.
Use React only for interactive UI components that genuinely require client-side state or browser interaction.
Use TypeScript for all application code, components, utilities, services, configuration, and data contracts.
Do not replace the current stack with Next.js, Vue, Svelte, Angular, jQuery, or other frameworks.

### 2. ASTRO-FIRST ARCHITECTURE
Prefer Astro components for page structure, layouts, navigation markup, static sections, content sections, SEO metadata, image rendering, data loading that can happen during build, non-interactive UI, and reusable presentation components.
Use React only when the component requires user interaction, local UI state, controlled forms, client-side filtering, modal behavior, tabs, accordions, carousels, dynamic menus, browser APIs, real-time UI updates, or complex animation state.
Minimize client-side JavaScript and use Astro islands deliberately. Choose the narrowest hydration directive possible (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`).

### 3. TYPESCRIPT REQUIREMENTS
All new source files must use TypeScript (`.astro`, `.tsx`, `.ts`).
Enable and preserve strict type checking. Avoid `any`, unsafe type assertions, unnecessary non-null assertions, and loosely typed API responses.

### 4. NO LEGACY IMPLEMENTATION
Do not introduce legacy code, deprecated APIs, outdated patterns, or compatibility layers unless the project explicitly requires them.
Avoid React class components, legacy lifecycle methods, string refs, outdated integrations, and jQuery-style DOM manipulation.

### 5. REACT HOOK RULES
Avoid `useEffect` whenever the same result can be achieved declaratively or during rendering. Use `useEffect` only for real external synchronization (browser events, timers, subscriptions, media queries, third-party libraries, analytics, browser storage, APIs).

### 6. REACT COMPONENT RULES
Use functional React components only. Components must have typed props, remain focused, avoid excessive internal state, and avoid duplicating server data into local state.

### 7. STATE MANAGEMENT
Use the smallest suitable state solution (Priority: static Astro data -> URL state -> local React state -> lifted state -> context).

### 8. DATA FETCHING
Prefer data fetching in Astro frontmatter or server-side loaders. Use React-side fetching only for user-triggered updates, live data, incremental loading, and client-only APIs.

### 9. STYLING RULES
Preserve the project's existing styling system. Avoid unnecessary inline styles, duplicated CSS, magic numbers, and JavaScript-driven styling when CSS can handle it. Prefer responsive CSS, grid, flexbox, logical properties, CSS custom properties, and semantic design tokens.

### 10. ANIMATION RULES
Prefer CSS transitions and keyframes for simple animation. Use GSAP or existing animation libraries only for complex animation. In React, isolate imperative animation integration carefully with refs, clean up listeners, and support `prefers-reduced-motion`.

### 11. PERFORMANCE RULES
Optimize for minimal browser JavaScript. Prefer server-rendered markup and static generation. Avoid excessive React roots, unnecessary memoization, and large client-side dependencies.

### 12. ACCESSIBILITY RULES
All implementation must preserve accessibility (semantic landmarks, native buttons/links, keyboard navigation, visible focus states, ARIA when native HTML is insufficient).

### 13. FILE AND ARCHITECTURE RULES
Follow the existing project folder structure (`src/pages`, `src/layouts`, `src/components`, `src/lib`, `src/services`, `src/types`, `src/styles`).

### 14. DEPENDENCY RULES
Do not add dependencies without verifying that the current stack cannot solve the problem. Evaluate bundle impact and verify compatibility.

### 15. CODE QUALITY RULES
Code must be typed, readable, maintainable, scoped, accessible, and performant. Avoid dead code, placeholder hacks, duplicated logic, oversized components, and hidden side effects.

### 16. REQUIRED REVIEW BEFORE EDITING
Before making changes: inspect package.json, astro.config.*, tsconfig.json, current folder structure, existing components/styling, animation dependencies, AGENTS.md, run git status, identify uncommitted changes. Then report current stack, relevant components, files to modify/create, whether React is required, expected useEffects and why they are necessary.

### 17. VALIDATION REQUIREMENTS
After meaningful implementation, run: `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`. Check TypeScript/Astro/hydration errors, broken routes, overflow, accessibility.

### 18. FINAL RESPONSE REQUIREMENTS
At the end of the task, report: files modified/created, Astro/React components used, hydration directives, every `useEffect` added (with purpose and cleanup info), legacy code encountered/removed, dependencies added/removed, exact validation results, remaining risks, and git status.
