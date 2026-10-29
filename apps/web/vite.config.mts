import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// The Cloudflare Vite plugin builds from wrangler.jsonc (the render of
// wrangler.template.jsonc): the Worker's source entry and its bindings. The
// build writes the Worker to dist/worker and the browser's assets to
// dist/client; wrangler.deploy.jsonc deploys the two.
export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
});
