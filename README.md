# redwoodsdk-starter

RedwoodSDK's [starter](https://github.com/redwoodjs/sdk/tree/main/starter)
— the framework's welcome page, with React Server Components, server
functions and client-side navigation — running on **one Cloudflare Worker
with Static Assets**, built by Vite through the
[Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
as RedwoodSDK always builds, with a first table in a **Cloudflare D1**
database provisioned by Terraform through
[Orun](https://github.com/sourceplane/orun) and its schema applied by
migrations, and packaged as an **Orun baseline**: one command takes a new
product from nothing to live on stage and prod, in its own repository, under
its own name — in ONE landing.

The starter is upstream's (MIT, © 2025 RedwoodJS Inc; `apps/web/LICENSE`):
its document, security headers, client entry and welcome page are kept as
written. Two things change. RedwoodSDK's **passkey addon is left out** — it
keeps its sessions and WebAuthn credentials in Durable Objects, which Orun has
no composition for — and **a D1 database is added instead**: the home page, a
server component, reads a `notes` table through the `DB` binding, and two
server functions write it, so the starter shows a database end to end. What
the baseline adds is everything needed to make a copy of it somebody else's,
built the way [cirrus-baseline](https://github.com/sourceplane/cirrus-baseline)
is since its one-landing bootstrap, on the shape of
[turso-starter](https://github.com/sourceplane/turso-starter) (one D1 root,
its migrations, one Worker). See
[`specs/epics/redwoodsdk-starter`](specs/epics/redwoodsdk-starter/README.md)
for the design, the milestones and the as-built status.

## Instantiating a product

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/redwoodsdk-starter
cd redwoodsdk-starter
orun new --blueprint repo-blueprint.yaml --out ~/sites/acme-notes --run-hooks --resume \
  --set reponame=acme-notes --set productname="Acme Notes" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`redwoodsdk-starter` → Build). Two phases: **`01-product`** creates the
repository and lands the whole product as ONE pull request — intent, CI,
tooling, the D1 root, the migrations, the site and its tests — and one
convergence, per environment, applies the D1 database, then its migrations,
then deploys the site with its id; **`02-docs`** records the live deployment
from probed facts. **[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **product only** — the app, its D1 root, its
migrations and their runner, its tests, its CI, its tooling, a README of its
own and its operating contract — renamed throughout to the product's name,
repository, Cloudflare Worker and database names. None of this repository's
machinery ships.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The product's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, wiring, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

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

## How it maps to RedwoodSDK's own setup

| RedwoodSDK starter | Here |
|---|---|
| `vite build` with `rwsdk/vite` and `@cloudflare/vite-plugin` | The same build (`apps/web/vite.config.mts`): the Worker in `dist/worker`, the browser's assets in `dist/client` |
| `wrangler.jsonc` with `name: "__change_me__"` | `wrangler.template.jsonc` (what the Vite plugin builds from) and `wrangler.deploy.template.jsonc` (what wrangler deploys: the built Worker, `no_bundle`, the client output as assets), both rendered per environment; the Worker is `<repo>-web-{dev,stage,prod}` |
| `pnpm release` (`rw-scripts ensure-deploy-env`, `wrangler deploy`) | Orun applies the database, migrates it and deploys `<repo>-web-{stage,prod}` on merge to `main`; the welcome page's deploy card says so |
| The passkey addon (`rwsdk addon passkey`: sessions and credentials in Durable Objects) | Left out — Durable Objects have no Orun composition |
| No database in the starter (`ensure-deploy-env` creates a D1 database on first release when the code reads `env.DB`) | `infra/terraform/cloudflare-d1`, applied by Orun before the migrations and the Worker, bound as `DB` |
| A table created by hand | `packages/db/src/migrations/010_notes`, applied by `infra/db-migrate` before the Worker deploys |
| `npm run dev` with a local D1 | `pnpm --filter @app/web dev`, wrangler's local D1 (`db:migrate:local` creates the table) |
| `npx create-rwsdk my-project-name` | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

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

## CI

| Workflow | What it runs | Ships to a product |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a product carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (packages type-checked, linted, tested and built, both test suites, the site built and dry-deployed per environment), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge applies the D1 database, migrates it, then deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
| `baseline.yml` | the baseline's own tiers: contract tests, the wiring path, the blueprint read by the pinned orun, the leak gate, the offline bootstrap with the product's own plan, the product built in the job tree, migrated, dry-deployed and served | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
