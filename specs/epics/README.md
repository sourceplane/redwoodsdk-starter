# Epics

Orun-style work programs. Each epic is a folder carrying `epic.yaml` (the
declaration the platform reads: slug, key prefix, milestones with exit
criteria and task keys) beside its doc set. The pull request that adds the
folder is the adoption; the merge creates the epic in the workspace.

| Epic | Cluster | Status | What it is |
|------|---------|--------|------------|
| [`redwoodsdk-starter/`](./redwoodsdk-starter/) | **RW** | ✅ Shipped (`baseline-v1`); live bootstrap pending | RedwoodSDK's starter on Cloudflare Workers with a first table in D1 in place of the passkey addon — and an Orun baseline that instantiates it in one landing, its database applied and migrated before the Worker deploys |

As-built ≠ intent: what shipped lives in each epic's `IMPLEMENTATION-STATUS.md`.
