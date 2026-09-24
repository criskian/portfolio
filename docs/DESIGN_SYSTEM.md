# Design system

Black and white dominate; electric blue is reserved for details. All tokens are
CSS custom properties in [`src/app/globals.css`](../src/app/globals.css), exposed
to Tailwind through `@theme inline` (e.g. `bg-bg`, `text-muted`, `text-accent`).

## Colour tokens

| Token                                | Dark (default)       | Light            | Used for                                   |
| ------------------------------------ | -------------------- | ---------------- | ------------------------------------------ |
| `--bg`                               | `#030304`            | `#ffffff`        | Page background                            |
| `--surface`                          | `#0b0b0f`            | `#f4f5f7`        | Cards, controls                            |
| `--surface-2`                        | `#121218`            | `#eceef2`        | Card media wells                           |
| `--fg`                               | `#fafafa`            | `#0a0a0a`        | Primary text                               |
| `--muted`                            | `#a1a1aa`            | `#52525b`        | Secondary text, labels                     |
| `--accent`                           | `#2f7bff`            | `#0038ff`        | Details, links, highlights                 |
| `--accent-glow`                      | `#5ea0ff`            | `#3d6bff`        | Glows, pulses                              |
| `--accent-strong`                    | `#1f5fff`            | `#0038ff`        | Filled surfaces with white text (AA 4.5:1) |
| `--accent-soft`                      | blue @ 14 %          | blue @ 10 %      | Radial washes                              |
| `--border` / `--border-strong`       | white @ 8 / 16 %     | black @ 8 / 16 % | Hairlines                                  |
| `--portrait-halo` / `-rim` / `-aura` | white / white / blue | blue             | Portrait glow layers                       |

Why two blues: a bright electric blue glows on black, while on white it fails
contrast — so light mode uses a deep electric blue. Filled buttons use
`--accent-strong` so white text always passes WCAG AA.

## Typography

| Role           | Family                    | Notes                                                            |
| -------------- | ------------------------- | ---------------------------------------------------------------- |
| Display & body | Geist Sans                | Tight negative tracking on display sizes                         |
| Labels, data   | Geist Mono                | `layer_0X — name` markers, epoch/loss, stack chips               |
| Emphasis       | Instrument Serif _italic_ | One or two words per section (`_like this_` in the dictionaries) |

Fluid sizes (no breakpoint jumps):

| Utility         | Size                                        |
| --------------- | ------------------------------------------- |
| `text-display`  | `clamp(2.75rem, 1.6rem + 5.2vw, 6.5rem)`    |
| `text-headline` | `clamp(2rem, 1.3rem + 3.2vw, 4.25rem)`      |
| `text-lead`     | `clamp(1.05rem, 0.95rem + 0.45vw, 1.35rem)` |

## Motion

- Easing: `--ease-out-expo` (entrances) and `--ease-in-out-quart` (toggles, rolls).
- Scroll-linked effects write **one** CSS custom property per block (`--p`,
  `--draw`, `--act`…) and let CSS compute the rest.
- `prefers-reduced-motion`: CSS animations are neutralised globally,
  `MotionConfig reducedMotion="user"` covers motion components, the SplashCursor
  is skipped and scroll-jacked sections render in their final state.

## Layout

- Max content width `max-w-7xl`; side gutters `px-4` (mobile) / `px-8`.
- Hero: `grid-cols-[5fr_7fr]` from `md`, portrait first; stacked (portrait on
  top) below `md`, sized with `svh` units for mobile browser bars.
- Projects: bento grid — 1 column → 2 (`md`) → 3 (`lg`); `lg` cards span two
  columns, the `wide` card spans a full row.
