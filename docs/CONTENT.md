# Editing content

## Texts (English & Spanish)

All copy lives in [`src/i18n/dictionaries/en.ts`](../src/i18n/dictionaries/en.ts)
and [`es.ts`](../src/i18n/dictionaries/es.ts). Both are typed against the
`Dictionary` interface in [`src/i18n/types.ts`](../src/i18n/types.ts): a missing
or extra key is a TypeScript error, and `tests/unit/dictionaries.test.ts` checks
that both languages have the same shape and no empty strings.

Inline markup supported in the copy:

| Markup         | Result                  |
| -------------- | ----------------------- |
| `**signal**`   | Electric-blue accent    |
| `_talks back_` | Instrument Serif italic |

## Projects

Projects live in [`src/content/projects.ts`](../src/content/projects.ts), in
display order (the first card is the featured one). Placeholder projects carry
`mock: true`: they get a "placeholder" badge and the section shows a short
notice while at least one remains. Delete them as real projects arrive.

```ts
{
  slug: "my-project",                        // unique, kebab-case
  title: "My Project",
  tagline: { en: "…", es: "…" },             // one line, shown in mono above the title
  summary: { en: "…", es: "…" },             // 2–3 sentences: problem → what was built → why it matters
  role: { en: "Data engineer", es: "Ingeniero de datos" },
  impact: { en: "−40% latency", es: "−40% de latencia" }, // one headline result
  metrics: [                                 // optional, 2–3 figures, shown on lg / wide cards
    { value: "10.6M", label: { en: "rows processed", es: "filas procesadas" } },
  ],
  stack: ["PySpark", "DuckDB"],              // 4–6 chips reads best
  year: 2026,                                // optional start year
  ongoing: true,                             // optional: shows "2026 → now"
  size: "md",                                // "lg" = 2 columns, "wide" = full row
  featured: false,
  cover: "graph",                            // lakehouse | document | graph | cloud | stream | vision | forecast | agents
  image: projectImage("my-project", { en: "Alt text…", es: "Texto alternativo…" }),
  links: { demo: "https://…", case: "https://…", repo: "https://…" },
}
```

### Screenshots

`projectImage(name, alt)` expects three 16:9 WebP files in
`public/images/projects/`: `name-640.webp`, `name-960.webp` and
`name-1280.webp`. Crop out browser/app chrome (toolbars, badges) and keep the
most important content in the top half — cards crop from the top (`object-top`).
Aim for ≤ 50 KB at 1280 px.

Tips for the bento grid (3 columns on desktop): combine sizes so rows fill up —
for example `lg + md`, `md + md + md`, `wide`.

## Links

GitHub, LinkedIn and the contact CTA target are in
[`src/content/social.ts`](../src/content/social.ts). The manifesto CTA currently
points to LinkedIn (`CONTACT_HREF`); switch it to a `mailto:` link if you prefer
email.

## Portrait

1. Replace `assets/source/portrait-transparent.png` (transparent background,
   subject roughly centred).
2. Run `pnpm images --force`.
3. If the crop size changed, copy the printed dimensions into
   [`src/content/portrait.ts`](../src/content/portrait.ts).

## Deployment URL

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://cristianmolina.dev`) in the hosting
environment so metadata, the sitemap and robots.txt use the real domain.
