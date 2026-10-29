// A small in-memory stand-in for a D1 database: enough SQL for the app's
// statements on the notes table (select, count, insert, delete). `migrated`
// is whether the migrations ran; without them D1 answers as it does for a
// missing table.
export type Row = { id: number; body: string };

export function fakeD1() {
  const state = { migrated: false, rows: [] as Row[], nextId: 1, calls: [] as { sql: string; args: unknown[] }[] };
  const missing = () => new Error("D1_ERROR: no such table: notes: SQLITE_ERROR");
  const db = {
    prepare(sql: string) {
      let args: unknown[] = [];
      const run = () => {
        state.calls.push({ sql, args });
        if (!state.migrated && /\bnotes\b/.test(sql)) throw missing();
        if (sql === "SELECT id, body FROM notes ORDER BY id") return { results: [...state.rows].sort((a, b) => a.id - b.id) };
        if (sql === "SELECT COUNT(*) AS n FROM notes") return { results: [{ n: state.rows.length }] };
        if (sql === "INSERT INTO notes (body) VALUES (?)") {
          state.rows.push({ id: state.nextId++, body: String(args[0]) });
          return { results: [] };
        }
        if (sql === "DELETE FROM notes WHERE id = ?") {
          state.rows = state.rows.filter((r) => r.id !== args[0]);
          return { results: [] };
        }
        throw new Error(`unexpected sql: ${sql}`);
      };
      const stmt = {
        bind(...a: unknown[]) {
          args = a;
          return stmt;
        },
        async all() {
          return { ...run(), success: true, meta: {} };
        },
        async first() {
          return run().results[0] ?? null;
        },
        async run() {
          run();
          return { success: true, meta: {} };
        },
      };
      return stmt;
    },
  };
  return { db: db as unknown as D1Database, state };
}
