# Deployment

Placeholders only. Real values live in the platform dashboards and in gitignored `.env` files, never in git. Use Node 24 everywhere (`.nvmrc`, `engines`).

## 1. Supabase

1. Link the project and push the schema: `supabase link --project-ref <project-ref>`, then `supabase db push`.
2. Auth, URL configuration: set **Site URL** and **Redirect URLs** to `https://<portal-domain>`.

## 2. API on Vercel

The API is a second Vercel project, because Railway requires a paid plan.

1. Import the same repo as a new project. Root directory = `apps/api`. `apps/api/vercel.json` sets install (`pnpm install --frozen-lockfile`) and build (`pnpm --filter @adhdont/api build:vercel`), which bundles the API into a Vercel Function (Build Output API v3, `.vercel/output`). Enable "Include source files outside of the Root Directory".
2. Settings, Node.js Version: 24.x.
3. Variables:

| Variable | Value |
|---|---|
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` (so the pinned pnpm is used; set it on both Vercel projects) |
| `PORTAL_ORIGIN` | `https://<portal-domain>` (the origin; a trailing slash or path is stripped) |
| `PORTAL_DOMAIN` | `<portal-domain>` |
| `API_DOMAIN` | `<api-domain>` (the API project's `*.vercel.app` domain, no scheme) |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | the project's anon key |

Locally, `pnpm dev` and `pnpm start` still run the API with `listen` on `PORT`.

A parent of the portal or API domain (for example `vercel.app`) is also refused on the block list, because blocking a domain blocks its subdomains.

## 3. Portal on Vercel

1. Import the repo. Root directory = `apps/web`. `apps/web/vercel.json` sets install (`pnpm install --frozen-lockfile`), build (`pnpm --filter @adhdont/web build`), output `dist`, and the rewrite that serves `/login` and `/register` on refresh. Enable "Include source files outside of the Root Directory".
2. Settings, Node.js Version: 24.x.
3. Variables: `ENABLE_EXPERIMENTAL_COREPACK` = `1`, `VITE_API_URL` = `https://<api-domain>`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## 4. Extension production build

1. Create `apps/extension/.env.prod` (gitignored; every key is required):

```
WXT_API_URL=https://<api-domain>
WXT_PORTAL_DOMAIN=<portal-domain>
WXT_SUPABASE_URL=https://<project-ref>.supabase.co
WXT_SUPABASE_ANON_KEY=<anon-key>
```

2. Build:
   - Chromium (Chrome, Edge, Opera): `pnpm build:extension:prod` -> `apps/extension/.output/chrome-mv3-prod`
   - Firefox: `pnpm build:extension:firefox:prod` -> `apps/extension/.output/firefox-mv3-prod`
   - Firefox zip: `pnpm zip:extension:firefox:prod` -> a `.zip` in `apps/extension/.output`
3. Local builds (`pnpm build:extension`, `pnpm build:extension:firefox`) read `apps/extension/.env` and write to `chrome-mv3` / `firefox-mv3`, so they never overwrite the prod output.
4. A build fails if a key is missing or invalid. `.env.prod` must define all four keys itself.
5. Load unpacked: `chrome://extensions` (Developer mode, Load unpacked), `edge://extensions`, `opera://extensions`; Firefox `about:debugging`, This Firefox, Load Temporary Add-on, pick `manifest.json`.

## 5. Verify

- `curl https://<api-domain>/health` returns `{"ok":true}`.
- Open `https://<portal-domain>/login`, refresh: the page loads.
- Register and log in on the portal, then run `docs/manual-checklist.md`.
