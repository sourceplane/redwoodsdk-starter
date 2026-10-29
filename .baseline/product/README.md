# redwoodsdk-starter

RedwoodSDK's starter — React Server Components, server functions and client
navigation on **one Cloudflare Worker with Static Assets**, built by Vite
through the Cloudflare Vite plugin — with a first table: notes in a
**Cloudflare D1** database that Terraform provisions per environment and
whose schema is applied by migrations before every deploy.

## Live deployment

<!-- 02-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace and the secrets the site uses into
[ai/context/deployment.md](ai/context/deployment.md); how the site deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 02-docs:end -->

## What is here

| Surface | Where |
|---|---|
| The Worker: its middleware, the routes and the document | `apps/web/src/worker.tsx`, `apps/web/src/app/document.tsx`, `headers.ts` |
| The welcome page (a server component and its client component) | `apps/web/src/app/pages` |
| The notes table and the page's server functions | `apps/web/src/app/notes` |
| The health route (the deploy's smoke) | `apps/web/src/app/api/health.ts` |
| The site's name and source link | `apps/web/src/app/site.ts` |
| Workers build, bindings and deploy contract | `apps/web/vite.config.mts`, `wrangler.template.jsonc` + `wrangler.deploy.template.jsonc` + `wiring.fixture.json` (→ `wrangler.jsonc`, `wrangler.deploy.jsonc`), `component.yaml` |
| The D1 database (stage, prod) | `infra/terraform/cloudflare-d1` |
| The schema (migrations) and their runner | `packages/db`, applied by `infra/db-migrate` |
| Tests | `tests/web`, `tests/db` (vitest) |

RedwoodSDK's passkey addon is not here: it keeps its sessions and WebAuthn
credentials in Durable Objects, which this repository's pipeline does not
provision. The notes table in D1 stands where it would, as the app's first
piece of state. It is public — anyone who can open the site can add or remove
a note — because it is there to show the binding; scope it to a user before
you keep anything in it.

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

Make the site yours in `apps/web/src/app/`, and its name and the repository
it links to in `apps/web/src/app/site.ts`. RedwoodSDK's guides are at
[docs.rwsdk.com](https://docs.rwsdk.com/).

## How the database is wired

The Worker binds the database as `DB` (read with `import { env } from
"cloudflare:workers"`). Its id is never hand-written: the two templates in
`apps/web` name it as a wiring token, and their renders are what builds and
deploys — `wrangler.jsonc`, which the Cloudflare Vite plugin builds from, and
`wrangler.deploy.jsonc`, which wrangler deploys (the built Worker, not
re-bundled, and the client output as its assets). Both are rendered from
`wiring.fixture.json` (placeholder ids) for local work and verification, and
on every deploy from the document the `cloudflare-d1` Terraform root
publishes after its apply (`WIRING_CLOUDFLARE_D1`, per environment). Edit a
template, then `pnpm run wire:fixture` and commit the renders with it.

The schema is `packages/db`'s migrations, not the app's: each
`src/migrations/<NNN>_<name>/up.sql` is listed in `src/manifest.ts` with
its checksum, and the `db-migrate` component applies the pending ones to
each environment's database before the site deploys. To change the schema,
add a migration (never edit an applied one — its checksum is recorded),
then `pnpm --filter @saas/db run manifest:fix`. Locally,
`pnpm --filter @app/web db:migrate:local` applies the same files to
wrangler's local D1; until it has run, the page says so instead of listing,
and `/api/health` answers 503.

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. Per environment, the D1 database
applies first, then its migrations, then the site builds with that
environment's database id and deploys — to `stage`, then to `prod` once
stage has converged on the same commit; `dev` only verifies. The Worker is
`redwoodsdk-starter-web-<env>` on your account's workers.dev subdomain, and
every deploy is smoke-tested over HTTP: the page must render to its end with
its notes count, and `/api/health` must answer ok from the database — which
only a Worker that queried it can. A pull request
runs the same pipeline's verify lanes: the packages type-checked, linted,
tested and built, both test suites, and the site built and dry-deployed for
each environment, with nothing deployed. (A push to `main` applies,
migrates, builds and deploys.)

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare tokens (one to deploy, one scoped to D1) and the account id are
brokered per run from the workspace's Cloudflare connection, and the
database ids travel as Orun secrets; nothing provider-shaped is stored in the
repository or in GitHub.

**Deploy by hand.** Orunbase's **Deploy** button on a component, or **Run
workflow** on the CI workflow in GitHub's Actions tab (on `main`), runs
`ci.yml` for the environment and components you pick, and each one deploys
exactly as a merge would deploy it. Leave the component blank to redeploy
every component in that environment, with nothing changed: after rotating a
secret, say. A component with nothing to run in that environment (a test
suite in `prod`) is left out with a notice.

## Custom domain

The site answers on workers.dev from its first deploy. To serve it on your
own domain, add the domain to the Cloudflare account the site deploys into
and attach it to the Worker (dashboard → Workers & Pages →
`redwoodsdk-starter-web-prod` → Settings → Domains & Routes → Add → Custom
domain). The page renders no absolute link to itself, so nothing else has to
change; the repository names the domain in one place, `BASE_DOMAIN` in
`intent.yaml`, which the site was born with as the reserved placeholder
`redwoodsdk-starter.example.com`. Replace it with your domain in the same change
that records it.
