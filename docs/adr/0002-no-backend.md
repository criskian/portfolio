# 0002 — No backend for v1

- **Status:** Accepted · 2026-09-24

## Context

A FastAPI backend was considered "if needed". v1 has no forms, no user data and
no dynamic content.

## Decision

Ship v1 without a backend. The contact CTA links to LinkedIn.

## Consequences

- Nothing to run, secure or pay for at runtime; faster responses from a CDN.
- Future options that would justify a FastAPI service: a contact endpoint with
  rate limiting, or an "Ask my AI" chat (RAG over the CV) that doubles as a
  showcase. It would live in a separate `apps/api/` package.
