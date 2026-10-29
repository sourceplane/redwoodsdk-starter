import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../apps/web/src"),
      // The Workers runtime's module, which the app reads its bindings from
      // (`import { env } from "cloudflare:workers"`): a stub whose `env` each
      // test fills with the bindings it needs.
      "cloudflare:workers": path.resolve(__dirname, "src/support/cloudflare-workers.ts"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
