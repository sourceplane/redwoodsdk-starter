# redwoodsdk-starter — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/redwoodsdk-starter/risks-and-open-questions.md`; this page lists only
what is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| RW-A | Not yet proven live: the `d1-edit` mint, the Terraform apply and its wiring publish, the migrations against the real D1 API, the deploy of the Vite build through `wrangler.deploy.jsonc` and the workers.dev probes | OPEN | One bootstrap from a tag against a workspace whose Cloudflare token can mint D1 Edit |

Accepted, and worth knowing before you change them: RW-B (no passkey addon:
it needs Durable Objects), RW-C (`wrangler.deploy.jsonc` restates what the
Vite plugin generates; tests/web holds the two templates together, and a
plugin upgrade that changes its output shape needs the template changed with
it), RW-D (D1's limits), RW-E (the migrations package is named `@saas/db`).
