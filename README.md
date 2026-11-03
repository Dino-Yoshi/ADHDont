# ADHDont

A free focus app: a web portal plus a browser extension that blocks distracting sites during a lockdown.

Live portal: https://adhdont.vercel.app. Live API: https://adhdont-api.vercel.app.

## Prerequisites

- Node.js 24 (LTS); the repo pins it in `.nvmrc`
- pnpm, enabled with `corepack enable`
- GitHub CLI, logged in with `gh auth login`
- Supabase keys for your `.env` files; ask Darien

## Setup

```sh
git clone https://github.com/Dino-Yoshi/ADHDont.git
cd ADHDont
pnpm install
```

Copy each app's example env file and fill in the values:

```sh
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp apps/extension/.env.example apps/extension/.env
```

Keep `PORTAL_DOMAIN` (in `apps/api/.env`) and `WXT_PORTAL_DOMAIN` (in `apps/extension/.env`) set; use `adhdont.com` locally, as in the examples. Without them the API won't start and extension builds fail.

## Run

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the portal at http://localhost:5173 and the API at http://localhost:3000 |
| `pnpm dev:extension` | Builds the extension in watch mode and opens Chrome with it loaded |
| `pnpm build:extension` | Builds the Chromium extension into `apps/extension/.output/chrome-mv3` |
| `pnpm build:extension:firefox` | Builds the Firefox extension into `apps/extension/.output/firefox-mv3` |
| `pnpm build:extension:prod` | Builds the Chromium extension for the live site into `apps/extension/.output/chrome-mv3-prod` |
| `pnpm build:extension:firefox:prod` | Builds the Firefox extension for the live site into `apps/extension/.output/firefox-mv3-prod` |
| `pnpm zip:extension:firefox:prod` | Zips the Firefox production build |
| `pnpm check` | Formats and lints everything with Biome |
| `pnpm typecheck` | Type-checks every package with `tsc` |
| `pnpm test` | Runs the tests |

The `:prod` commands read `apps/extension/.env.prod`, which is gitignored and required (see `docs/deployment.md`).

## Load the extension

- **Chrome:** go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick `apps/extension/.output/chrome-mv3` (local) or `chrome-mv3-prod` (live site).
- **Edge:** go to `edge://extensions` and follow the same steps as Chrome.
- **Opera:** go to `opera://extensions` and follow the same steps as Chrome.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and pick `manifest.json` in `apps/extension/.output/firefox-mv3` (local) or `firefox-mv3-prod` (live site). Firefox removes temporary add-ons when it closes, so load it again after a restart.

After rebuilding, click the reload icon on the extension's card.

## Deployment

The portal and the API run on Vercel, and Supabase holds the database and auth. See `docs/deployment.md`.

## Testing

`pnpm test` runs the lockdown core's unit tests. The rest is checked by hand with `docs/manual-checklist.md`.

Supported browsers are Chrome, Edge, Opera and Firefox. For this release only Firefox was checked on the live site; the others are supported targets that were not checked by hand.

## Work on a ticket

1. Pick an open ticket whose blockers are all merged: https://github.com/Dino-Yoshi/ADHDont/issues
2. Tell your agent: `do ticket #N`. It reads `AGENTS.md`, makes a branch and opens a PR.
3. Run the app and check that the feature actually works.
4. Merge the PR.
