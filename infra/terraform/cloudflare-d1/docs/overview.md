# cloudflare-d1

Provisions the Cloudflare D1 notes database for stage and prod

Terraform-managed infrastructure, planned and applied per environment by its CI lane.

|              |                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Type         | `terraform`                                                                                          |
| Source       | `infra/terraform/cloudflare-d1`                                                                      |
| Environments | `stage`: `plan-only`, `apply` on a push to `main` · `prod`: `plan-only`, `apply` on a push to `main` |

## Depends on

- (none)

## Depended on by

- **db-migrate** — Applies the notes schema (packages/db's migrations) to the stage and prod Cloudflare D1 databases
- **web** — The RedwoodSDK app (React Server Components on one Cloudflare Worker with Static Assets, built by Vite, per environment)
