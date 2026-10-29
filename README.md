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
| The D1 database (stage, prod) | `infra/terraform/cloudflare-d1` |
| The schema (migrations) and the runner that applies them over the D1 REST API | `packages/db`, run by `infra/db-migrate` |
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


## How the database reaches the Worker

```
infra/terraform/cloudflare-d1 ──apply──► orun secret WIRING_CLOUDFLARE_D1 (stage, prod)
                                               │   (the landing's await checks it exists)
                                               ▼
infra/db-migrate  dependsOn cloudflare-d1 (enforced on main) · secretEnv WIRING_CLOUDFLARE_D1
  apply:  packages/db's runner → POST …/d1/database/<id>/query, each pending migration once
                                               ▼
apps/web  dependsOn cloudflare-d1 + db-migrate (enforced on main) · secretEnv WIRING_CLOUDFLARE_D1_<ENV>
  build:  tooling/wire/live.mjs → wrangler.jsonc + wrangler.deploy.jsonc with the environment's
          database id (dev, verify-only, renders the fixture) → vite build
  deploy: wrangler deploy --config wrangler.deploy.jsonc (dist/worker + dist/client)
```

`wrangler.jsonc` and `wrangler.deploy.jsonc` are committed as the fixture
renders of their templates, because the deploy lane's `verify-app-structure`
step checks the config it deploys exists before it builds;
`testing/wire.test.sh` and `tests/web` fail if a render and its template
disagree.

