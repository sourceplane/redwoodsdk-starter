# Epic: redwoodsdk-starter (RW)

**RedwoodSDK already runs on Workers: it is a Vite plugin over the Cloudflare Vite plugin, and its app is a Worker that renders React Server Components and serves its client build as Static Assets. What the starter needs from Orun is a pipeline and somewhere to keep state. The port keeps the starter as written, leaves out RedwoodSDK's passkey addon — its sessions and WebAuthn credentials live in Durable Objects, which Orun has no composition for — and adds a D1 database in its place: a `notes` table the home page reads in a server component and writes through two server functions, provisioned by Terraform and migrated before the Worker deploys.**

The port keeps the document (its title now the site's name), the security
headers middleware, the client entry with RSC client navigation, the
`linkFor` helper and the welcome page with its styles and Copy button. It
adds the notes section, the health route, the site seam, the two wrangler
configs, the D1 root, the migrations, tests and the deploy contract.

## Status

| Field | Value |
|-------|-------|
| Status | ✅ Shipped (`baseline-v1`) — RW0 (#1), RW1 (#2), RW2 (#3), RW3 (#4), RW4 (#5); proven offline in Baseline CI; not yet live (risk RW-A) |
| Cluster | **RW** (RW0–RW4) |
| Owner(s) | `apps/web` · `infra/terraform/cloudflare-d1` · `packages/db` · `infra/db-migrate` |
| Builds on | `hono-api` (the catalogue's fork: its tooling and tests) on `turso-starter`'s shape (one D1 root, its migrations, one Worker with Static Assets); `react-router-postgres`'s build-and-deploy config pair for the Cloudflare Vite plugin |
| Upstream | [redwoodjs/sdk › starter](https://github.com/redwoodjs/sdk/tree/main/starter) (MIT, © 2025 RedwoodJS Inc), at `c221073` — `rwsdk` 1.7.5 |
| Changes | the passkey addon left out, D1 notes added, the deploy card, the site seam, the health route, tests and the deploy contract |
| Gate | RW1 is the first user-visible rung. |

## Read order

1. `design.md` — what maps to what, the build and deploy configs, the data path
2. `implementation-plan.md` — the milestones and what "done" means for each
3. `risks-and-open-questions.md` — what could go wrong and what was decided
4. `IMPLEMENTATION-STATUS.md` — what actually shipped (kept distinct from intent)

## Milestones at a glance

| Milestone | What it lands | Done when |
|---|---|---|
| RW0 — the spec | intent, CI, tooling, the spec index, this doc set and the task contracts | merged on `main` |
| RW1 — the RedwoodSDK app on Workers | `apps/web`, `packages/db`'s schema and runner, `tests/web`, `tests/db` | `wrangler dev` over the build serves the page; a note round-trips through the server functions |
| RW2 — the D1 database | `infra/terraform/cloudflare-d1`, `infra/db-migrate`, the web component's edges | the plan orders the apply, the migrations and the Worker on main |
| RW3 — ready to instantiate | README, as-built status | a reader can run, test, preview and deploy it |
| RW4 — a baseline | card, build document, rename, bootstrap tooling, tests | a new site goes from nothing to live in one landing; Baseline CI green |
