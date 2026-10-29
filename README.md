# redwoodsdk-starter

An Orunbase starter baseline, being built: RedwoodSDK's
[starter](https://github.com/redwoodjs/sdk/tree/main/starter) (React Server
Components on Workers) with D1, on the Cirrus baseline conventions — in
place of the starter's passkey addon (Durable Objects, which Orun has no
composition for), a first table in Cloudflare D1.

Upstream: https://github.com/redwoodjs/sdk/tree/main/starter (MIT, © 2025
RedwoodJS Inc).

It lands in five reviewed steps (RW0–RW4); the plan, the design and the
risks are in [`specs/epics/redwoodsdk-starter`](specs/epics/redwoodsdk-starter/README.md).

## What is here (the product)

| Surface | Where |
|---|---|
| The Worker: middleware, routes, the document and its headers | `apps/web/src/worker.tsx`, `apps/web/src/app/document.tsx`, `headers.ts` |
| The welcome page (a server component, and the client component it renders) | `apps/web/src/app/pages` |
| The notes table and the page's server functions | `apps/web/src/app/notes` |
| The health route the deploy's smoke reads | `apps/web/src/app/api/health.ts` |
| The site's name and source link | `apps/web/src/app/site.ts` |
| Workers build, bindings and deploy contract | `apps/web/vite.config.mts`, `wrangler.template.jsonc` + `wrangler.deploy.template.jsonc` + `wiring.fixture.json` (→ the committed `wrangler.jsonc`, `wrangler.deploy.jsonc`), `component.yaml` |
| The schema (migrations) and the runner that applies them over the D1 REST API | `packages/db` |
| The wrangler renderer, the migration helpers | `tooling/wire`, `tooling/migrations` |
| Tests | `tests/web` (the notes table, the server functions and the health route against an in-memory D1; the two wrangler configs), `tests/db` (the migrations through the runner, into real SQLite) |


## Getting started

```bash
pnpm install
pnpm run wire:fixture   # render apps/web's two wrangler configs from the offline fixture
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # vite build → apps/web/dist/worker + apps/web/dist/client
```

```bash
pnpm --filter @app/web db:migrate:local   # create the notes table in wrangler's local D1
pnpm --filter @app/web dev                # http://localhost:5173 — vite dev, the local D1 as DB
pnpm --filter @app/web preview            # wrangler dev over the built Worker, same local D1
```

