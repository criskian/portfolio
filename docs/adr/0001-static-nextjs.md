# 0001 — Next.js App Router, fully static output

- **Status:** Accepted · 2026-09-24

## Context

The site is a single page whose content is known at build time. It needs React
component libraries (React Bits, Skiper UI — the latter built for Next.js and
shadcn), excellent first-load performance on phones, SEO metadata and a social
preview image.

## Decision

Use Next.js (App Router) with TypeScript and Tailwind CSS v4. Every route —
the page, `/opengraph-image`, `/sitemap.xml`, `/robots.txt`, `/icon.svg` — is
prerendered at build time. Images are processed by our own sharp pipeline and
served with `<picture>`, so no image-optimisation server is required.

## Consequences

- Any static host or CDN can serve the site; hosting can be decided later.
- The framework runtime (~160 KB gzip) is a fixed cost we optimise around.
- Components that need the browser (WebGL, scroll) are client components;
  metadata and layout stay on the server.
