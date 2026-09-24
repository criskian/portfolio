# Architecture

A single, statically prerendered page. There is no backend: everything the site
needs is known at build time, so the HTML, the Open Graph image, the sitemap and
robots.txt are all generated during `next build` (see
[ADR 0001](adr/0001-static-nextjs.md) and [ADR 0002](adr/0002-no-backend.md)).

## Build pipeline

```mermaid
flowchart LR
  A["assets/source/portrait-transparent.png"] -->|scripts/optimize-images.mjs| B["public/images/generated/<br/>AVIF + WebP 320–800w<br/>halo + rim alpha masks"]
  C["src/ (TSX, dictionaries, content)"] --> D["next build"]
  B --> D
  D --> E["Static HTML + JS chunks"]
  D --> F["/opengraph-image (PNG)"]
  D --> G["/sitemap.xml · /robots.txt · /icon.svg"]
```

## Runtime composition

```mermaid
flowchart TD
  L["app/layout.tsx<br/>(server) fonts · metadata"] --> P["Providers (client)<br/>ThemeProvider · I18nProvider · LazyMotion"]
  P --> PG["app/page.tsx (server)"]
  PG --> H["Header<br/>nav · LanguageToggle · ThemeToggle"]
  PG --> SC["SplashController<br/>(single WebGL instance)"]
  PG --> S1["Suspense → Hero<br/>data-splash=on"]
  PG --> T1["Suspense → ForwardPass<br/>data-splash=off"]
  PG --> S2["Suspense → Projects<br/>data-splash=off"]
  PG --> T2["Suspense → ActivationBands<br/>data-splash=off"]
  PG --> S3["Suspense → Manifesto + Footer<br/>data-splash=on"]
  SC -. reads zones .-> S1 & S2 & S3
```

Every section sits in its own `<Suspense>` boundary so React hydrates them as
separate units and yields to the main thread in between (shorter tasks, lower
TBT).

## Key modules

| Module                                      | Responsibility                                                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/cursor/splash-store.ts`         | React-free store: section geometry, "is the pointer over an active zone?", visible band for clipping, current palette.                                                                 |
| `components/cursor/SplashController.tsx`    | Owns the one SplashCursor instance: lazy mount on first interaction, device tier, clip-path updates, `html[data-splash-state]`, reduced-motion opt-out.                                |
| `components/cursor/SplashCursor.tsx`        | WebGL fluid simulation (React Bits port) with zone-gated input and a sleeping render loop.                                                                                             |
| `i18n/`                                     | Typed dictionaries (`Dictionary` interface) + client provider. English is in the static HTML; Spanish is a runtime switch (`?lang=es`) — see [ADR 0003](adr/0003-client-side-i18n.md). |
| `components/text/rich.ts`                   | Tiny markup for the copy: `**accent**` and `_serif italic_`.                                                                                                                           |
| `components/text/*Reveal*` / `BlurRichText` | Text effects driven by one CSS custom property or one IntersectionObserver per block — no per-word JS.                                                                                 |
| `components/transitions/ForwardPass.tsx`    | Scroll-linked SVG network, mounted on demand, animated through CSS variables.                                                                                                          |
| `content/`                                  | Projects (typed, bilingual), social links, portrait metadata.                                                                                                                          |
| `lib/device.ts`                             | Performance tier detection (`high` / `medium` / `low`), WebGL detection, idle scheduling.                                                                                              |

## Theme and hydration

`next-themes` sets the `dark` / `light` class before first paint (dark is the
default, system preference is ignored on purpose). Colours are CSS variables, so
most components never need the theme in JavaScript. Where a value must be
computed in JS (WebGL colours, inline styles of vendored components),
`useIsLight()` reports _dark_ until the component is mounted, avoiding hydration
mismatches between the server HTML and a stored light preference.

## SplashCursor zones

```mermaid
sequenceDiagram
  participant U as User
  participant W as window
  participant C as SplashController
  participant S as splash-store
  participant G as SplashCursor (WebGL)
  U->>W: first pointermove / touchstart
  W->>C: mount SplashCursor (tier-based config)
  U->>W: pointermove(clientY)
  W->>G: handler
  G->>S: isActiveAt(clientY)?
  alt over hero / manifesto
    S-->>G: true → splat + wake render loop
  else over projects / transitions
    S-->>G: false → ignore (loop sleeps after 2.5 s)
  end
  W->>C: scroll
  C->>S: visibleBand()
  C->>C: canvas clip-path = visible "on" band
```

See [ADR 0004](adr/0004-splash-cursor-zones.md) for why a single persistent
instance with zone gating was chosen over mounting/unmounting per section.
