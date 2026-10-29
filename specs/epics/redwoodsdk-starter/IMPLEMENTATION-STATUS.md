# Implementation status — redwoodsdk-starter

As-built, kept distinct from the design. Every departure from the upstream
starter is listed.

| Milestone | Pull request | State |
|---|---|---|
| RW0 — the spec | sourceplane/redwoodsdk-starter#1 | ✅ merged |
| RW1 — the RedwoodSDK app on Workers | sourceplane/redwoodsdk-starter#2 | ✅ merged |
| RW2 — the D1 database | sourceplane/redwoodsdk-starter#3 | ✅ merged |
| RW3 — ready to instantiate | sourceplane/redwoodsdk-starter#4 | ✅ merged |
| RW4 — a baseline | sourceplane/redwoodsdk-starter#5 | ✅ merged; `baseline-v1` |

## Departures from upstream (`redwoodjs/sdk › starter` at `c221073`)

| Upstream | Here | Why |
|---|---|---|
| `rwsdk: workspace:*` | `rwsdk: 1.7.5` | The published release of the SDK at that commit; every other pin as upstream's |
| `wrangler.jsonc` (`name: "__change_me__"`, no bindings) | `wrangler.template.jsonc` + `wrangler.deploy.template.jsonc`, rendered per environment; `DB` bound to the environment's D1 database | Orun names the Worker per environment and binds the database it provisioned |
| `src/app/pages/home.tsx` renders `<Welcome />` | An async server component that reads the notes and passes them to the welcome page | The D1 table that stands in for the passkey addon |
| The welcome page: two sections | Three: "Next steps", "Your first table" (the notes, a form, a Remove button per note), "Deploy to Cloudflare" | As above; the upstream sections are kept as written but for the deploy card |
| "Welcome to RedwoodSDK"; `<title>@redwoodjs/starter-minimal</title>` | "Welcome to {SITE_NAME}"; `<title>{SITE_NAME}</title>`, `SITE_NAME = "RedwoodSDK"` in `src/app/site.ts` | The seam a product's name is written into; the baseline itself reads as upstream does |
| The deploy card: `pnpm release` | `git push origin main`, and a link to the repository | Orun deploys on merge |
| The favicons in `public/`, linked by nothing | Linked from the document, light and dark | A starter's own icons, served |
| No `/api/health` | `GET /api/health` — `{"ok":true,"notes":N}`, or 503 before the migrations | The deploy's smoke |
| `dev:init`, `generate`, `release`, `worker:run`, `check`, `types` scripts | `dev`, `build`, `preview`, `typecheck`, `lint`, `wire:fixture`, `db:migrate:local` | The pipeline builds, checks and deploys; `dev:init` would run `npm` inside a pnpm workspace on a fresh checkout |
| `worker-configuration.d.ts` generated with `ASSETS` | Written by hand with `ASSETS` and `DB` | The binding the app reads |
| The passkey addon (optional) | Not included | Durable Objects (risk RW-B) |

## Proven

- Offline, in Baseline CI: the contract tiers, the generated component docs,
  the blueprint read by the pinned orun, the leak gate, the offline bootstrap
  with the product's own plan (cloudflare-d1 → db-migrate → web on main), and
  the end-to-end tier — the stage lanes' steps in the staged tree, the
  migrations against a stand-in D1 API, and the built Worker served: the
  notice and a 503 before the schema, the smoke after it, a note added and
  removed through the page's own server functions, a cross-origin call
  refused.
- Not yet live (risk RW-A).
