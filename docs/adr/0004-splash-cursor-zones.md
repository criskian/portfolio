# 0004 — One persistent SplashCursor gated by section zones

- **Status:** Accepted · 2026-09-24

## Context

Non-negotiable requirement: the React Bits SplashCursor must be active on the
first (hero) and last (manifesto) sections only, and disabled on the projects.
Mounting/unmounting it per section would recompile ~10 shader programs on every
crossing (visible stutter) and churn WebGL contexts, which browsers cap.

## Decision

- Mount **one** instance (on the first pointer/touch interaction) and keep it.
- Sections declare `data-splash="on" | "off"`; a React-free store caches their
  geometry. Input handlers inject fluid only when the pointer is over an `on`
  zone; entering a zone resets the pointer delta to avoid a jump splat.
- The fixed canvas is clipped (`clip-path: inset(...)`) to the visible `on`
  section, so fluid never paints over the projects.
- The render loop sleeps ~2.5 s after the last splat.
- Touch devices run it at low resolution; `prefers-reduced-motion` skips it.
- `html[data-splash-state]` exposes the state for end-to-end tests.

## Consequences

- Crossing sections costs nothing; GPU usage is zero while idle.
- The rule is verified automatically in `tests/e2e/splash-cursor.spec.ts`.
