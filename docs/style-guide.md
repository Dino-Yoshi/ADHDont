# Code style guide

Biome enforces formatting and lint rules. Everything else here is convention that the tooling can't check. When code and this guide disagree, fix one of them in the same PR.

## Formatting

Biome owns formatting, configured once at the repo root. Run it rather than formatting by hand.

- 2-space indent, double quotes, semicolons, trailing commas, line width 100.

## Words

Use these terms in code, UI text and tickets:

| Use | For | Not |
|---|---|---|
| lockdown | a timed period of blocking | session, timer, focus |
| block list | the user's list of domains | blacklist, sites |
| domain | a cleaned-up entry like `youtube.com` | url, site |
| coins | the reward | points, currency |
| portal | the web app | dashboard, site |
| extension | the browser extension | plugin, addon |

## TypeScript

- Use `type`, not `interface`.
- Use named exports only. Default exports appear only where a tool requires them (WXT entrypoints, Vite config).
- Use `async`/`await`, not `.then()` chains.
- Data from outside the program (request bodies, API responses, storage, env) arrives as `unknown` and is parsed with a Zod schema before use. A type comes from its schema with `z.infer`, so it's written once.
- Times travel over the wire as ISO strings (`endsAt: "2026-11-01T14:30:00.000Z"`), and only the server decides whether a lockdown has ended.

```ts
// shared: one schema, one type
export const lockdownSchema = z.object({
  id: z.string().uuid(),
  domains: z.array(z.string()),
  startedAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});
export type Lockdown = z.infer<typeof lockdownSchema>;
```

## Naming

- Files are kebab-case: `block-list.tsx`, `lockdown-routes.ts`.
- React components are PascalCase, one component per file, and the file is named after it (`block-list.tsx` exports `BlockList`).
- Functions are camelCase verbs: `normaliseDomain`, `startLockdown`.
- Booleans read as yes/no questions: `isActive`, `hasLockdown`.
- Constants that never change are UPPER_SNAKE: `DEFAULT_BLOCK_LIST`, `MAX_LOCKDOWN_MINUTES`.

## Where code goes

- Business rules (domains, lockdown status, coins) live in the lockdown core in `packages/shared`. Apps call it and keep no rules of their own.
- Apps import shared code as `@adhdont/shared`, never by relative path into the package.
- Each app reads its environment once, in a config module that parses `process.env` / `import.meta.env` with Zod. Everything else imports from that config module.

## API (Fastify)

Routes stay thin: check input with the shared schema, call the lockdown core, query the database, and return a value. Errors are `{ "message": string }` with the right status code, and the message is safe to show the user.

```ts
app.post("/lockdown", async (request, reply) => {
  const { minutes } = startLockdownBodySchema.parse(request.body);
  if (!isValidLockdownLength(minutes)) {
    return reply.code(400).send({ message: "Pick a length from 5 minutes to 12 hours." });
  }
  // ...
});
```

## Portal (React)

- Use function components and hooks. Plain `useState` / `useEffect`, with no state library.
- All API calls go through the app's one API client module, which adds the login token and parses every response with its shared schema. Components never call `fetch` directly.
- Use plain CSS with custom properties in one global stylesheet. There's no CSS framework.

```tsx
export function CoinTotal({ coins }: { coins: number }) {
  return <p className="coin-total">{coins} coins</p>;
}
```

## Extension (WXT)

- Use the `browser` API from WXT, so the same code runs on Chromium and Firefox.
- Storage keys are constants in one module, never inline strings.

## Comments

Write a one-line comment when the *why* isn't obvious from the code. Leave the *what* to the names.

```ts
// Chromium alarms fire at most once a minute, so poll on the same cadence.
browser.alarms.create("poll-lockdown", { periodInMinutes: 1 });
```

## Tests

- Only the lockdown core has unit tests (Vitest). Name each test after the behaviour it checks:

```ts
test("a lockdown stopped early earns no coins", () => { /* ... */ });
```

- Tests call public functions with plain values and an explicit `now`, and check only what's returned.
