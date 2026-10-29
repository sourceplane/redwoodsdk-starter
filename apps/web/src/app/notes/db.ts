// The notes table, through the D1 binding. The schema is a migration
// (packages/db/src/migrations/010_notes) that db-migrate applies before the
// Worker deploys; until it has run, D1 answers "no such table", and these
// helpers say so (`null`) rather than throw, so the page can show how to
// migrate and the health route can answer 503.

export type Note = { id: number; body: string };

/** The longest note the form accepts (and the server keeps). */
export const MAX_NOTE_LENGTH = 280;

function missingTable(err: unknown): boolean {
  return /no such table/i.test(String(err instanceof Error ? err.message : err));
}

export async function listNotes(db: D1Database): Promise<Note[] | null> {
  try {
    const { results } = await db.prepare("SELECT id, body FROM notes ORDER BY id").all<Note>();
    return results ?? [];
  } catch (err) {
    if (missingTable(err)) return null;
    throw err;
  }
}

export async function countNotes(db: D1Database): Promise<number | null> {
  try {
    const row = await db.prepare("SELECT COUNT(*) AS n FROM notes").first<{ n: number }>();
    return row?.n ?? 0;
  } catch (err) {
    if (missingTable(err)) return null;
    throw err;
  }
}

/** Trims a note to what is kept; an empty one is not a note. */
export function normalizeNote(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const body = input.trim().slice(0, MAX_NOTE_LENGTH);
  return body === "" ? null : body;
}

export async function insertNote(db: D1Database, body: string): Promise<void> {
  await db.prepare("INSERT INTO notes (body) VALUES (?)").bind(body).run();
}

export async function deleteNote(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
}
