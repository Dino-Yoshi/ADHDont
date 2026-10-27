# ADHDont

A free focus app: a web portal plus a browser extension that blocks distracting sites during a lockdown.

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

## Run

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the portal at http://localhost:5173 and the API at http://localhost:3000 |
| `pnpm dev:extension` | Builds the extension in watch mode and opens Chrome with it loaded |
| `pnpm build:extension` | Builds the Chromium extension into `apps/extension/.output/chrome-mv3` |
| `pnpm build:extension:firefox` | Builds the Firefox extension into `apps/extension/.output/firefox-mv3` |
| `pnpm check` | Formats and lints everything with Biome |
| `pnpm typecheck` | Type-checks every package with `tsc` |
| `pnpm test` | Runs the tests |

## Load the extension

- **Chrome:** go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick `apps/extension/.output/chrome-mv3`.
- **Edge:** go to `edge://extensions` and follow the same steps as Chrome.
- **Opera:** go to `opera://extensions` and follow the same steps as Chrome.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and pick `manifest.json` in `apps/extension/.output/firefox-mv3`. Firefox removes temporary add-ons when it closes, so load it again after a restart.

After rebuilding, click the reload icon on the extension's card.

## Work on a ticket

1. Pick an open ticket whose blockers are all merged: https://github.com/Dino-Yoshi/ADHDont/issues
2. Tell your agent: `do ticket #N`. It reads `AGENTS.md`, makes a branch and opens a PR.
3. Run the app and check that the feature actually works.
4. Merge the PR.
