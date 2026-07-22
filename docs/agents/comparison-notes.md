# Layout Correction Comparison Notes

## Issue Addressed
The previous layout failed to remain centered at low browser zoom levels or very wide monitors. This occurred because multiple sections used `100vw` measurements or relied on unbound, padding-based constraints (`.u-container`).

## Implemented Solution
A new unified container system was introduced to properly constrain content without requiring JavaScript or `transform` scaling.

1. **Global CSS Update**: 
   - Created `--page-max-width` (88rem) and `--page-wide-max-width` (110rem) variables.
   - Replaced `.u-container` logic with `.page-container` and `.page-container--wide`.
   - The `.page-container` uses `width: min(calc(100% - (var(--page-gutter) * 2)), var(--page-max-width))` and `margin-inline: auto` to perfectly center content naturally.

2. **Section Migrations**:
   - `SiteHeader.astro` & `SiteFooter.astro` now use `.page-container--wide`.
   - `HeroSection.astro` now wraps its core grid in `.page-container--wide`.
   - `StoryPoster.astro`, `StoryStatements.astro`, and `ServicesIntro.astro` had their wrappers updated to use the new `.page-container--wide` system instead of full-bleed viewports with padding hacks.
   - All horizontal viewport units (`vw`) inside `StoryPoster.astro` and `StoryStatements.astro` were migrated to standard percentages (`%`) so that absolute elements size correctly relative to the new `.page-container--wide` wrapper.

## Visual QA Results
The browser subagent confirmed that the layout correctly respects the `110rem` maximum width threshold across tested breakpoints (1920x1080, 2560x1440, and 3840x2160):
- Content blocks do not drift sideways on wide screens.
- All navigation links and footer elements remain anchored in alignment with the central content.
- Visual overlays (e.g. decorative images) maintain proper proportions and placement thanks to the migration from `vw` to `%`.

## Build Status
- `npm run build` ran successfully (1.54s).
- 0 errors, 0 warnings, 0 hints were found in TypeScript typechecking.
