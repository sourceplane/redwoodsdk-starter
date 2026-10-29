# redwoodsdk-starter — where this repository stands

The entry page for anyone (or any agent) picking this repository up. It is
this repository's own state and does not ship to a product built from it;
the two pages that do are [operations.md](operations.md) and
[deployment.md](deployment.md).

## What it is

RedwoodSDK's starter — the framework's welcome page, React Server Components
and server functions — on one Cloudflare Worker with Static Assets, built by
Vite through the Cloudflare Vite plugin, with a first table (notes) in a D1
database Terraform provisions and a migration creates, in place of the
passkey addon (whose sessions live in Durable Objects). Packaged as an Orun
baseline: `orun new --blueprint repo-blueprint.yaml` builds a new product in
its own repository and takes it to live on stage and prod in one landing
(`01-product`: cloudflare-d1 → db-migrate → web per environment), then
records what went live (`02-docs`).

## Release

| | |
|---|---|
| Latest tag | `baseline-v1` (RW4 — redwoodsdk-starter becomes an Orun baseline) |
| Proven live | No. Everything short of the platform is proven offline in Baseline CI: the migration lane against a stand-in D1 API, and a note added and removed through the built Worker's own server functions; a live bootstrap from a tag is still to come (risk RW-A) |

## Where to read

| Question | Page |
|---|---|
| What shipped, and every departure from upstream | `specs/epics/redwoodsdk-starter/IMPLEMENTATION-STATUS.md` |
| Why it is built this way | [decisions.md](decisions.md), then `specs/epics/redwoodsdk-starter/design.md` |
| What could still go wrong | [open-risks.md](open-risks.md), then `specs/epics/redwoodsdk-starter/risks-and-open-questions.md` |
| How to instantiate it | `BOOTSTRAP.md`, `docs/phases/` |
| What each component is | `<component>/docs/` beside each `component.yaml` — `apps/web`, `packages/db`, `infra/db-migrate`, `infra/terraform/cloudflare-d1`, `tests/{web,db}` (generated; `python3 tooling/catalog/gen-component-docs.py`) |

## Next

1. Bootstrap one product from `baseline-v1` against a workspace whose
   Cloudflare token can mint D1 Edit as well as Workers Scripts, and record
   its timings in the phase cards (closes RW-A).
