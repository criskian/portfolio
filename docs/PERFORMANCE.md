# Performance

## Results

Local Lighthouse runs against `pnpm build && pnpm start` (simulated throttling):

| Profile                  | Perf  | A11y | Best practices | SEO |  LCP   |    TBT     |  CLS  |
| ------------------------ | :---: | :--: | :------------: | :-: | :----: | :--------: | :---: |
| Desktop                  |  99   | 100  |      100       | 100 | 0.8 s  |   20 ms    | 0.001 |
| Mobile (slow 4G, 4× CPU) | 71–78 | 100  |      100       | 100 | 3.4 s* | 470–830 ms |   0   |

\* Observed LCP equals FCP (≈1.3 s unthrottled); the simulated value is driven by
the amount of JavaScript evaluated before it — mostly React + Next.js runtime
(~160 KB gzip, fixed cost of the framework).

CI enforces budgets with Lighthouse CI: [`lighthouserc.mobile.json`](../lighthouserc.mobile.json)
and [`lighthouserc.desktop.json`](../lighthouserc.desktop.json).

## What keeps it fast

**Nothing expensive runs before it is needed**

- The SplashCursor (WebGL fluid) mounts on the first pointer/touch interaction,
  not on load — shader compilation never competes with first render.
- WebThreads (hero), DotGrid (projects) and Particles (manifesto) load after idle,
  only on desktop-class devices (`lib/device.ts` tiers), and pause off screen.
- The forward-pass SVG network mounts when its section is ~1 viewport away, in a
  single variant (desktop or mobile).
- ScrollVelocity marquees only mount near the viewport.

**Few components, lots of CSS**

- Word reveals, the scroll-assembled heading, the nav text roll and the network
  animation write _one_ CSS custom property per block; CSS computes per-word /
  per-letter / per-path values. This removed ~450 animation components from
  hydration.
- `LazyMotion` + `m` components with asynchronously loaded `domAnimation` features.
- Each section is its own `<Suspense>` boundary → hydration is split into
  shorter tasks.

**No layout shift**

- Portrait has an explicit aspect ratio; decrypting text reserves the width of
  its final glyphs; fonts are self-hosted by `next/font` with `display: swap`.

**Assets**

- Portrait: trimmed and encoded at build time (480 KB PNG → 6–17 KB AVIF),
  served through `<picture>` with `srcset`/`sizes` and `fetchPriority="high"`.
- The glow is two pre-baked alpha masks tinted by CSS — zero runtime filters,
  one asset for both themes.
- Project covers are procedural SVG (0 bytes of images).
- Hero name and portrait enter with CSS animations, so the LCP paints on the
  first frame instead of waiting for JavaScript.

**GPU budget**

- At most two WebGL contexts are active at once; every canvas caps its device
  pixel ratio and stops rendering when hidden, off screen or idle.

## Measuring locally

```bash
pnpm build && pnpm start -p 3100
npx lighthouse http://localhost:3100 --preset=desktop --view
npx lighthouse http://localhost:3100 --view            # mobile
```

Headless Chrome renders WebGL in software (SwiftShader), so WebGL-heavy numbers
in headless runs are pessimistic compared with real devices.

## Ideas for later

- Replace remaining runtime `useTheme` reads in vendored components with CSS
  variables to avoid a post-hydration re-render.
- Server-render project covers as static SVG files referenced by `<img>`.
- Evaluate React Server Components for the purely static parts of each section.
