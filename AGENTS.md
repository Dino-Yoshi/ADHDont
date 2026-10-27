# ADHDont

A free focus app. The web app is a portal where users manage their account, block list and lockdowns. A browser extension enforces each lockdown, even while the portal is closed.

The specs live in `docs/`: requirements (FR/NFR numbers) are in `Focus App PRD_SRS … .docx`, and the design is in `Focus App PDD_SDS … .docx`. Read the SDS before changing how the pieces talk to each other.

This is a deliberately small app due 2026-11-07. Build the simplest thing that meets the ticket.

## Layout

The repo is a pnpm workspace:

| Path | What | Owner |
|---|---|---|
| `apps/web` | Portal: React + TypeScript + Vite | Daveigh |
| `apps/api` | REST API: Fastify + TypeScript, Supabase Postgres + Auth | Darien |
| `apps/extension` | Lockdown enforcement: WXT + TypeScript | King |
| `packages/shared` | Zod schemas and types for every API request and response | shared |

- Every API payload is defined once, in `packages/shared`. The API and both clients import it from there.
- Stay inside the app your ticket names. When a change touches `packages/shared` or another owner's app, say so in the PR description so that owner reviews it.

## Code

- Before writing or reviewing code, read `docs/style-guide.md`: formatting, naming, domain words, TypeScript, and how the API, portal and extension are written.
- TypeScript `strict` everywhere. Commit only code that passes Biome.
- Logins go through Supabase Auth; the app never stores passwords. The API verifies the Supabase JWT on every route, and every table has row-level security.
- Each app keeps its secrets in a gitignored `.env` and commits a `.env.example` listing every key with a placeholder value.

## Git

- Work on a branch named after the ticket, e.g. `12-block-list-editor`.
- Open a PR into `main` with `Closes #12` in the body, and merge it once it works.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on Dino-Yoshi/ADHDont, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
