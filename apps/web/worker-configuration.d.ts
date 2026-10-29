/* eslint-disable */
// The Worker's bindings, as `wrangler types --include-runtime false` writes
// them from wrangler.jsonc: the static assets and the D1 database.
declare namespace Cloudflare {
	interface GlobalProps {
		mainModule: typeof import("./src/worker");
	}
	interface Env {
		ASSETS: Fetcher;
		DB: D1Database;
	}
}
interface Env extends Cloudflare.Env {}
