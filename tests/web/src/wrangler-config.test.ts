import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";

// apps/web carries TWO wrangler configs, both rendered by tooling/wire and
// both COMMITTED as their fixture render:
//   wrangler.jsonc         what the Cloudflare Vite plugin builds from
//                          (`vite dev` too): main is the source entry;
//   wrangler.deploy.jsonc  what the lanes dry-run and deploy: main is the
//                          built entry, no re-bundling — the composition checks
//                          it exists BEFORE the build, so it cannot be the
//                          dist/worker/wrangler.json the plugin writes.
// These hold each render to its template, the two to each other, and a lane's
// live render to the document it is given.
const app = path.resolve(__dirname, "../../../apps/web");
const wire = path.resolve(__dirname, "../../../tooling/wire");
const PAIRS = [
  ["wrangler.template.jsonc", "wrangler.jsonc"],
  ["wrangler.deploy.template.jsonc", "wrangler.deploy.jsonc"],
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonc(text: string): Record<string, any> {
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, ""));
}

function render(script: "render.mjs" | "live.mjs", template: string, env: string, extra: string[] = [], wiring?: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "wire-"));
  try {
    const out = path.join(dir, "out.jsonc");
    const args =
      script === "render.mjs"
        ? ["--map", path.join(app, "wiring.fixture.json"), "--env", env]
        : ["--components", "cloudflare-d1", "--env", env, ...extra];
    execFileSync(process.execPath, [path.join(wire, script), "--template", path.join(app, template), "--out", out, ...args], {
      env: { ...process.env, ...wiring },
      stdio: "pipe",
    });
    return readFileSync(out, "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("apps/web wrangler configs", () => {
  it.each(PAIRS)("%s is committed as its fixture render (pnpm run wire:fixture)", (template, out) => {
    expect(readFileSync(path.join(app, out), "utf8")).toBe(render("render.mjs", template, "stage"));
  });

  it.each(PAIRS)("%s keeps the database a wiring token, never a real id", (template) => {
    const text = readFileSync(path.join(app, template), "utf8");
    expect(text).not.toMatch(/"database_id":\s*"[0-9a-f-]{36}"/);
    const config = jsonc(text);
    expect(config.d1_databases).toEqual([
      {
        binding: "DB",
        database_name: "@@wiring(cloudflare-d1/__ENV__:d1_database_name)@@",
        database_id: "@@wiring(cloudflare-d1/__ENV__:d1_database_id)@@",
      },
    ]);
  });

  it("deploys the config the lanes check before they build", () => {
    const manifest = readFileSync(path.join(app, "component.yaml"), "utf8");
    const workerName = manifest.match(/^\s*workerName:\s*(\S+)\s*$/m)?.[1];
    const deploy = jsonc(readFileSync(path.join(app, "wrangler.deploy.template.jsonc"), "utf8"));
    expect(workerName).toBe(deploy.name);
    expect(manifest).toMatch(/^\s*wranglerConfig:\s*wrangler\.deploy\.jsonc\s*$/m);
    expect(manifest).toMatch(/^\s*workerEntrypoint:\s*dist\/worker\/index\.js\s*$/m);
    expect(manifest).toMatch(/^\s*assetsDir:\s*dist\/client\s*$/m);
  });

  it("builds and deploys the same Worker: name, compatibility, bindings and settings agree", () => {
    const build = jsonc(readFileSync(path.join(app, "wrangler.template.jsonc"), "utf8"));
    const deploy = jsonc(readFileSync(path.join(app, "wrangler.deploy.template.jsonc"), "utf8"));
    for (const key of ["name", "compatibility_date", "compatibility_flags", "d1_databases", "observability"]) {
      expect(deploy[key], key).toEqual(build[key]);
    }
    expect(build.main).toBe("src/worker.tsx");
    expect(deploy.main).toBe("./dist/worker/index.js");
    expect(deploy.no_bundle).toBe(true);
    expect(deploy.assets).toEqual({ directory: "./dist/client", binding: build.assets.binding });
  });

  it.each(PAIRS)("%s renders a deploy lane its own environment from the live wiring document", (template) => {
    const rendered = jsonc(
      render("live.mjs", template, "prod", [], {
        WIRING_CLOUDFLARE_D1_PROD: JSON.stringify({ d1_database_id: "5ca1ab1e-0000-4000-8000-00000000a003", d1_database_name: "prod-x-prod" }),
      }),
    );
    expect(rendered.d1_databases[0]).toEqual({
      binding: "DB",
      database_id: "5ca1ab1e-0000-4000-8000-00000000a003",
      database_name: "prod-x-prod",
    });
  });

  it("renders dev, which nothing applies to, from the fixture", () => {
    const rendered = jsonc(
      render("live.mjs", "wrangler.deploy.template.jsonc", "dev", ["--fixture", path.join(app, "wiring.fixture.json"), "--fixture-envs", "dev"]),
    );
    expect(rendered.d1_databases[0].database_id).toBe("00000000-0000-0000-0000-000000000002");
  });

  it("refuses a deploy render with no wiring document", () => {
    expect(() => render("live.mjs", "wrangler.deploy.template.jsonc", "stage", [], { WIRING_CLOUDFLARE_D1_STAGE: "" })).toThrow();
  });
});
