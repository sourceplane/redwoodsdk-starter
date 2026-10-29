# web

The RedwoodSDK app (React Server Components on one Cloudflare Worker with Static Assets, built by Vite, per environment)

A Cloudflare Worker with Static Assets (server rendering plus static files), deployed per environment by its CI lane.

|              |                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Type         | `cloudflare-workers-assets-turbo`                                                                                  |
| Source       | `apps/web`                                                                                                         |
| Package      | `@app/web`                                                                                                         |
| Environments | `dev`: `verify` · `stage`: `verify`, `deploy` on a push to `main` · `prod`: `verify`, `deploy` on a push to `main` |

## Depends on

- **cloudflare-d1** — Provisions the Cloudflare D1 notes database for stage and prod
- **db-migrate** — Applies the notes schema (packages/db's migrations) to the stage and prod Cloudflare D1 databases

## Depended on by

- (none)
