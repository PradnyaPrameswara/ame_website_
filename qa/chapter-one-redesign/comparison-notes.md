# Visual QA Comparison Notes

## Media Changes
- **Image A (upper)**: Moved upward and slightly to the left. Scaled down to 14vw. Placed carefully to avoid covering the start of the word 'MAKE'.
- **Image B (left)**: Reduced by 40-50% in size (now 13vw). Pushed further left. Ensures it only overlaps the first few letters of the left margin and leaves the center typography uninterrupted.
- **Image C (right)**: Reduced in scale to 17vw. Pushed right to intersect the right boundary, avoiding the pale center text.
- **Image D (lower-right)**: Moved downward and pushed further right. Explicit vertical spacing created so it doesn't stack directly over Image C.

## Overlap & Readability Rules Respected
- The dark primary text ('WE MAKE OBJECTS FOR LIVING WELL,') remains above most media (z-index: 3 vs media z-index: 2), ensuring legibility.
- The pale continuation text is intentionally tucked underneath the media layers (z-index: 1).
- Images no longer cover the horizontal center of the typography, framing the composition nicely.

## Remaining Intentional Differences
- Maintained the AME specific red-banner branding and removed the right-side 'W. Site of the Day' tab per previous design discussions.
