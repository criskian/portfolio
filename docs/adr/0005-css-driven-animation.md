# 0005 — CSS-variable–driven scroll animations

- **Status:** Accepted · 2026-09-24

## Context

The first implementation used one motion component per animated word, letter or
SVG path (~450 components). Lighthouse mobile showed 1.7 s of Total Blocking
Time, mostly hydration of those components.

## Decision

For scroll-linked or staggered effects, compute a single value per block in
JavaScript (scroll progress or "in view") and write it to a CSS custom property;
per-element values are derived in CSS with `calc()`/`clamp()` and the element's
index (`--i`). Motion components are kept for the few elements that need
springs or presence animations, via `LazyMotion` + `m`.

## Consequences

- Mobile TBT dropped by more than half and CLS reached 0.
- Effects are defined in `globals.css` next to the tokens they use.
- New effects should follow this pattern unless they need physics or exit
  animations.
