# 0003 — Client-side i18n with typed dictionaries

- **Status:** Accepted · 2026-09-24

## Context

The page must default to English with a toggle to Spanish. Route-based i18n
(`/en`, `/es`) would remount the page on every switch — including the
persistent WebGL SplashCursor — and complicate static hosting (root redirects).

## Decision

English is rendered into the static HTML. A client `I18nProvider` swaps to the
Spanish dictionary at runtime, updates `<html lang>` and the title, and mirrors
the choice in the URL (`?lang=es`) so it can be shared. Both dictionaries are
typed against one `Dictionary` interface.

## Consequences

- Instant switch without remounting; the switch even re-plays the decrypt effects.
- Search engines index the English version; `?lang=es` is declared as an
  alternate. Spanish-first SEO would need route-based i18n later.
- Both dictionaries ship to the client (a few KB).
