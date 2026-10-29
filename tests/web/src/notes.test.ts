import { describe, expect, it } from "vitest";

import { countNotes, deleteNote, insertNote, listNotes, MAX_NOTE_LENGTH, normalizeNote } from "@/app/notes/db";

import { fakeD1 } from "./support/d1";

describe("the notes table (apps/web/src/app/notes/db.ts)", () => {
  it("says the table is missing (null) before the migrations, instead of throwing", async () => {
    const { db } = fakeD1();
    await expect(listNotes(db)).resolves.toBeNull();
    await expect(countNotes(db)).resolves.toBeNull();
  });

  it("rethrows any other database error", async () => {
    const db = {
      prepare: () => ({
        all: async () => {
          throw new Error("D1_ERROR: network connection lost");
        },
        first: async () => {
          throw new Error("D1_ERROR: network connection lost");
        },
      }),
    } as unknown as D1Database;
    await expect(listNotes(db)).rejects.toThrow(/network/);
    await expect(countNotes(db)).rejects.toThrow(/network/);
  });

  it("inserts, lists in order, counts and deletes through bound parameters", async () => {
    const { db, state } = fakeD1();
    state.migrated = true;
    await expect(listNotes(db)).resolves.toEqual([]);
    await insertNote(db, "first");
    await insertNote(db, "second'); DROP TABLE notes; --");
    await expect(listNotes(db)).resolves.toEqual([
      { id: 1, body: "first" },
      { id: 2, body: "second'); DROP TABLE notes; --" },
    ]);
    await expect(countNotes(db)).resolves.toBe(2);
    await deleteNote(db, 1);
    await expect(listNotes(db)).resolves.toEqual([{ id: 2, body: "second'); DROP TABLE notes; --" }]);
    const writes = state.calls.filter((c) => !c.sql.startsWith("SELECT"));
    expect(writes.map((c) => c.args)).toEqual([["first"], ["second'); DROP TABLE notes; --"], [1]]);
  });

  it("keeps a note trimmed and at most MAX_NOTE_LENGTH long, and refuses an empty one", () => {
    expect(normalizeNote("  hello  ")).toBe("hello");
    expect(normalizeNote("x".repeat(MAX_NOTE_LENGTH + 20))).toHaveLength(MAX_NOTE_LENGTH);
    expect(normalizeNote("   ")).toBeNull();
    expect(normalizeNote(null)).toBeNull();
    expect(normalizeNote(new Blob(["file"]))).toBeNull();
  });
});
