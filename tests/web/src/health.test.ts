import { beforeEach, describe, expect, it } from "vitest";

import { env } from "cloudflare:workers";

import { health } from "@/app/api/health";

import { fakeD1 } from "./support/d1";

let d1: ReturnType<typeof fakeD1>;

beforeEach(() => {
  d1 = fakeD1();
  (env as unknown as Record<string, unknown>).DB = d1.db;
});

describe("GET /api/health (apps/web/src/app/api/health.ts)", () => {
  it("answers 503 before the migrations, so a deploy's smoke refuses an unmigrated database", async () => {
    const res = await health();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, reason: "schema" });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("counts the notes once the table exists, and writes nothing", async () => {
    d1.state.migrated = true;
    d1.state.rows.push({ id: 1, body: "a" }, { id: 2, body: "b" });
    const res = await health();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, notes: 2 });
    expect(d1.state.calls.every((c) => c.sql.startsWith("SELECT"))).toBe(true);
  });
});
