import { env } from "cloudflare:workers";

import { countNotes } from "@/app/notes/db";

// GET /api/health — answered by the Worker alone, from the D1 database behind
// its DB binding: `{"ok":true,"notes":N}` once the migrations have created the
// `notes` table, 503 with `{"ok":false,"reason":"schema"}` before. Read-only,
// so the smoke every deploy ends with writes nothing into prod.
export async function health(): Promise<Response> {
  const notes = await countNotes(env.DB);
  if (notes === null) {
    return Response.json(
      { ok: false, reason: "schema", hint: "run the migrations (db-migrate, or pnpm run db:migrate:local)" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json({ ok: true, notes }, { headers: { "cache-control": "no-store" } });
}
