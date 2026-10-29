# RedwoodSDK Minimal Starter

This is the starter project for RedwoodSDK, from
[redwoodjs/sdk › starter](https://github.com/redwoodjs/sdk/tree/main/starter)
(MIT, © 2025 RedwoodJS Inc — see `LICENSE`). It's a template designed to get
you up and running as quickly as possible. Here it runs on one Cloudflare
Worker with Static Assets, with a D1 database bound as `DB` for its notes.

## Running the dev server

```shell
pnpm run db:migrate:local   # the notes table, in wrangler's local D1
pnpm run dev
```

Point your browser to the URL displayed in the terminal (e.g.
`http://localhost:5173/`). You should see the welcome page in your browser,
with the notes you add below its next steps.

## Build and preview

```shell
pnpm run build     # dist/worker (the Worker) and dist/client (its assets)
pnpm run preview   # wrangler dev over the built Worker
```

The repository's pipeline deploys it: `wrangler.deploy.jsonc` is what ships,
rendered with each environment's database id. Edit the `*.template.jsonc`
files, never their renders, then `pnpm run wire:fixture`.

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1)
