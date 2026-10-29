# Design — redwoodsdk-starter

## 1. What it is, and what it is built on

The upstream is RedwoodSDK's own starter, `redwoodjs/sdk › starter` at
`c221073` (MIT, © 2025 RedwoodJS Inc): a Worker whose `defineApp` runs a
security-headers middleware and renders one route, `/`, through a `Document`
into the framework's welcome page — a client component with its CSS module
and a Copy button — with RSC client navigation in `src/client.tsx`. The
monorepo builds it against `rwsdk: workspace:*`; here it pins the published
`rwsdk` 1.7.5, the SDK's version at that commit, and every other dependency
exactly as upstream pins it.

The catalogue names `hono-api` as the starter to fork, and its tooling and
tests are what this tree carries. But `hono-api` is a plain Worker with no
data tier, deployed by `cloudflare-worker-turbo`; this app is a Worker with
Static Assets and a D1 database. That is `turso-starter`'s exact shape — one
D1 root, its migrations, one Worker — so the tree is laid out as
turso-starter's is (the two share their tooling and tests line for line
outside the data tier), and `apps/web` is the starter.

## 2. The passkey addon, and D1 in its place

RedwoodSDK's optional passkey addon (`rwsdk addon passkey`) adds WebAuthn
sign-in, and keeps its sessions and credentials in two Durable Objects
(`addons/passkey/src/session/durableObject.ts`,
`src/passkey/durableObject.ts`). Orun has no Durable Objects composition, so
the addon is left out — the starter itself has no sign-in either — and a D1
database stands in its place as the app's first state:

- `notes(id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT <now>)`, created by the migration
  `packages/db/src/migrations/010_notes`;
- `src/app/pages/home.tsx` — now an async server component — reads the
  table through `env.DB` (`import { env } from "cloudflare:workers"`, as
  RedwoodSDK's own guides read bindings) and hands the rows to the welcome
  page, which renders them as a "Your first table" section between its two
  upstream sections;
- `src/app/notes/functions.ts` (`"use server"`) — `addNote` and
  `removeNote`, the section's two form actions; RedwoodSDK re-renders the
  page with their result, so the list is read back from D1 after every
  change;
- `src/app/notes/db.ts` — the four statements, bound parameters only; a
  missing table is `null`, not an exception, so the page shows how to
  migrate and `/api/health` answers 503.

## 3. Build and deploy

`vite build` with `rwsdk/vite` and `@cloudflare/vite-plugin`, as upstream:
the Worker in `dist/worker/index.js`, the browser's assets in `dist/client`.
The web component is `cloudflare-workers-assets-turbo` (a Worker plus an
assets directory in one `wrangler deploy`), not `hono-api`'s
`cloudflare-worker-turbo`, which deploys one definition with `--env` and
checks no assets.

The plugin builds from `wrangler.jsonc` (its `main` is the source entry,
`src/worker.tsx`) and writes a deployable copy, `dist/worker/wrangler.json`,
only after it has built. The lane checks the config it deploys exists before
it builds, in a job tree staged without `dist/`, so the deploy names a second
committed config, `wrangler.deploy.jsonc`, which says what the generated one
says: `main: ./dist/worker/index.js`, `no_bundle: true`, the build's chunks as
ES modules, `./dist/client` as assets — the pattern `react-router-postgres`
uses for the same plugin. Both are rendered by `tooling/wire` from their
templates and the D1 root's wiring document; `tests/web` holds each render to
its template and the two templates to each other.

## 4. Data path and order

```
infra/terraform/cloudflare-d1 ──apply──► WIRING_CLOUDFLARE_D1 (stage, prod)
infra/db-migrate   dependsOn cloudflare-d1 (enforced on main)  → 010_notes over the D1 REST API
apps/web           dependsOn cloudflare-d1 + db-migrate (enforced on main)
                   → both wrangler configs rendered with the database id → vite build → wrangler deploy
```

The D1 apply and the migrations use their own `d1-edit` key
(`CLOUDFLARE_D1_TOKEN`); the deploy token cannot touch D1. On a pull request
every edge is advisory: the root plans, the migrations plan offline, the site
builds and dry-deploys.

## 5. The deploy contract

The smoke fetches `/` and requires `</html>` and `data-notes="N"`, then
`/api/health` and requires `"ok":true` — which only a Worker that counted the
migrated table can answer. Read-only: no deploy writes a note. The welcome
page's deploy card says `git push origin main` where upstream says
`pnpm release` (`rw-scripts ensure-deploy-env` + `wrangler deploy`), because
Orun deploys on merge and `release` would deploy outside the pipeline and
create a database of its own.

## Out of scope

- The passkey addon, and any other addon or feature that needs Durable
  Objects (`rwsdk/realtime`, `rwsdk/db`'s Durable Object SQLite,
  `use-synced-state`).
- Per-user notes: there is no sign-in to scope them by (risk RW-G).
