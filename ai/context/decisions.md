# redwoodsdk-starter — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | The tree is turso-starter's shape (one D1 root, its migrations, one Worker with Static Assets), its tooling and tests shared with hono-api's | hono-api, the fork the catalogue names, is a plain Worker with no data tier; this app is a Worker with Static Assets and a D1 database, which is turso-starter's exact shape | design.md §1 |
| 2 | The passkey addon is left out; a `notes` table in D1 stands in its place | The addon keeps sessions and WebAuthn credentials in Durable Objects, which Orun has no composition for; a table shows the database end to end without them | design.md §2, risk RW-B |
| 3 | The app is upstream's starter as written — document, headers, client entry, welcome page — plus the notes section, the health route and the site seam | Keep its look and behaviour; the additions are the database and what the pipeline needs | IMPLEMENTATION-STATUS (RW1) |
| 4 | The web component is `cloudflare-workers-assets-turbo`, not hono-api's `cloudflare-worker-turbo` | The build emits a Worker and an assets directory; worker-turbo deploys one definition with `--env` and checks no assets | `apps/web/component.yaml`, design.md §3 |
| 5 | Two wrangler configs: `wrangler.jsonc` (what the Vite plugin builds from) and `wrangler.deploy.jsonc` (what wrangler deploys: `dist/worker/index.js`, `no_bundle`, `dist/client` as assets), both rendered per environment and committed as fixture renders | The plugin writes its deployable copy only after a build, and the lane checks the config it deploys exists before it builds, in a tree staged without `dist/` | `apps/web/wrangler.deploy.template.jsonc`, `tests/web/src/wrangler-config.test.ts` |
| 6 | The schema is a migration (`packages/db`'s `010_notes`), applied by `infra/db-migrate` between the D1 apply and the Worker's deploy; the app never writes DDL | The convergence's order then includes the schema | design.md §4 |
| 7 | An unmigrated database is a notice on the page and a 503 from `/api/health`, never a crash | A fresh local checkout, and any deploy whose migrations did not land, says what to do | `apps/web/src/app/notes/db.ts` |
| 8 | The smoke requires `</html>` and `data-notes="N"` on `/`, and `"ok":true` from `/api/health` | Only a Worker that read the migrated table renders them; read-only, so no deploy writes a note | `apps/web/component.yaml` |
| 9 | Dependencies pinned as upstream pins them: `rwsdk` 1.7.5 (the monorepo's `workspace:*` at the ported commit), React 19.2.8, Vite ~8.2, wrangler 4.118.0, TypeScript 7.0.2 for the app | Upstream's own tested set; `tooling/eslint` carries TypeScript 5 for typescript-eslint, whose parser does not take 7 | `apps/web/package.json` |
| 10 | The welcome page's deploy card says `git push origin main`, not `pnpm release` | Orun deploys on merge; `release` would deploy with wrangler outside the pipeline and create a database of its own | IMPLEMENTATION-STATUS (RW1) |
| 11 | The D1 apply and the migrations use their own `d1-edit` key (`CLOUDFLARE_D1_TOKEN`) | The `workers-deploy` token cannot touch D1 | design.md §4 |
| 12 | The migrations package is named `@saas/db` | stack-tectonic's db-migrate composition builds `--filter=@saas/db` | `packages/db/package.json` |
| 13 | stack-tectonic 0.19.0, not 0.20.0 | 0.20.0 links the install out of the job's tree, a layout this Vite build has not been proven under | `intent.yaml` (the pin's comment) |
| 14 | The console card reads `subdomain` from the Cloudflare connection and asks for no domain | Inherited: the subdomain has one right answer; the site goes live on workers.dev and a domain is the owner's step | `blueprint.yaml` |
| 15 | Component docs are generated from the manifests and checked in CI | A hand-written copy of the dependency graph, bindings and migrations drifts silently | `tooling/catalog/gen-component-docs.py` |
