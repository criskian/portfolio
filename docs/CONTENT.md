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

The six current projects are **placeholders** (`PROJECTS_ARE_MOCKS = true` in
[`src/content/projects.ts`](../src/content/projects.ts) shows a notice under the
section title). To add a real one:

```ts
{
  slug: "my-project",                       // unique, kebab-case
  title: "My Project",
  tagline: { en: "…", es: "…" },            // one line, shown in mono above the title
  summary: { en: "…", es: "…" },            // 1–2 sentences: problem → what you built
  role: { en: "Lead engineer", es: "Ingeniero líder" },
  impact: { en: "−40% latency", es: "−40% de latencia" }, // one headline metric
  stack: ["Python", "FastAPI", "AWS"],
  year: 2026,
  size: "md",                               // "lg" = 2 columns, "wide" = full row
  featured: false,
  cover: "graph",                           // graph | cloud | stream | vision | forecast | agents
  image: "/images/projects/my-project.webp", // optional 16:10 screenshot, replaces the cover
  links: { case: "https://…", repo: "https://…" },
}
```

When all projects are real, set `PROJECTS_ARE_MOCKS` to `false`.

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
