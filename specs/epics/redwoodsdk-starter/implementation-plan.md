# Implementation plan — redwoodsdk-starter

| Milestone | Task | What lands | Done when |
|---|---|---|---|
| RW0 — the spec | RW-1 | intent (`ws_CHANGE_ME`), `ci.yml` (turso-starter's, byte for byte), shared tooling, the spec index, this doc set, the task contracts | merged; CI's plan job green |
| RW1 — the RedwoodSDK app on Workers | RW-2 | `apps/web` — the starter on rwsdk 1.7.5, the notes section, the health route, the site seam, the two wrangler templates and their renders; `packages/db` (`010_notes` and the runner); `tests/web`, `tests/db` | typecheck, lint, test and build green; under `wrangler dev` over the build, no table → the notice and a 503; migrated → a note added and removed through the server functions |
| RW2 — the D1 database | RW-3 | `infra/terraform/cloudflare-d1`, `infra/db-migrate`; the web component's `dependsOn` and wiring secretEnv | `orun plan` on a push to main orders cloudflare-d1 → db-migrate → web per environment |
| RW3 — ready to instantiate | RW-4 | the README, the as-built status | a reader can run, test, preview and deploy it |
| RW4 — a baseline | RW-5 | `blueprint.yaml`, `repo-blueprint.yaml`, `.baseline/`, the rename and bootstrap tooling, the context pack, the component docs, `testing/`, `baseline.yml`, `tag.yml` | Baseline CI green; `baseline-v1` cut by `tag.yml` |
