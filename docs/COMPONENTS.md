# Third-party components

Components come from two libraries, installed with the shadcn CLI using the
registries declared in [`components.json`](../components.json):

```bash
pnpm dlx shadcn@latest add @react-bits/<Name>-TS-TW -p src/components/reactbits
pnpm dlx shadcn@latest add @skiper-ui/skiper<N>
```

Vendored files stay as close to upstream as possible so they are easy to diff
and update. Every local change is marked in the code with a `Portfolio` comment
and listed here. ESLint relaxes a few stylistic rules for `src/components/reactbits/**` only.

## React Bits — `src/components/reactbits/`

License: MIT + Commons Clause · <https://reactbits.dev>

| Component      | Where                                | Local changes                                                                                                                                                        |
| -------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SplashCursor   | Global (`components/cursor/`)        | Rewritten in TypeScript; zone-gated input, sleeping loop, palette colours, DPR cap per tier, context released on unmount, fresh canvas per mount.                    |
| DecryptedText  | Hero greeting & name, project titles | Screen-reader copy fixed (was `visibility:hidden` and announced scrambled frames); each scrambled glyph reserves the width of its final character (no layout shift). |
| RotatingText   | Hero role                            | `motion` → `m` components (LazyMotion).                                                                                                                              |
| StarBorder     | Hero CTA                             | Keyframes added to `globals.css`.                                                                                                                                    |
| Magnet         | Social links, manifesto CTA          | —                                                                                                                                                                    |
| WebThreads     | Hero background                      | `maxDpr` prop for performance tiers. Desktop-class devices only.                                                                                                     |
| BorderGlow     | Project cards                        | —                                                                                                                                                                    |
| DotGrid        | Projects background                  | Canvas loop pauses off screen; DPR capped at 1.5; root `section` → `div`. Desktop only.                                                                              |
| ScrollVelocity | Activation bands                     | `m` components; mounted only near the viewport.                                                                                                                      |
| ShinyText      | Manifesto CTA hint                   | `m` components.                                                                                                                                                      |
| Particles      | Manifesto background                 | Renders only on screen / visible tab. Desktop only.                                                                                                                  |
| ClickSpark     | Manifesto CTA                        | Draw loop runs only while sparks are alive.                                                                                                                          |

The React Bits effects of _BlurText_ and _ScrollReveal_ are reproduced in
`components/text/` (rich-text support, CSS-driven, no GSAP).

## Skiper UI — `src/components/skiper/` and `components/layout/ThemeToggle.tsx`

License: free components, attribution required · <https://skiper-ui.com>

| Skiper                            | Local name                      | Local changes                                                                                                              |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| skiper26 (theme toggle)           | `layout/ThemeToggle.tsx`        | Circle variant only; reveal starts at the button's centre; instant switch without View Transitions or with reduced motion. |
| skiper41 (progressive blur)       | `ProgressiveBlur`               | Themed with CSS variables.                                                                                                 |
| skiper58 (text roll)              | `TextRoll`                      | Pure CSS port (no per-letter JS), focus-visible support.                                                                   |
| skiper40 (animated link, Link003) | `AnimatedLink`                  | External-link attributes, focus-visible support.                                                                           |
| skiper31 (scroll typography, V1)  | `ScrollAssembleText`            | One scroll value → CSS variable instead of three motion values per letter; no Lenis.                                       |
| skiper19 (scroll path drawing)    | Technique used in `ForwardPass` | Re-implemented with `pathLength="1"` + CSS variables.                                                                      |
