import { beforeEach, describe, expect, it } from "vitest";

import { env } from "cloudflare:workers";

import { addNote, removeNote } from "@/app/notes/functions";

import { fakeD1 } from "./support/d1";

let d1: ReturnType<typeof fakeD1>;

beforeEach(() => {
  d1 = fakeD1();
  d1.state.migrated = true;
  (env as unknown as Record<string, unknown>).DB = d1.db;
});

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

describe("the page's server functions (apps/web/src/app/notes/functions.ts)", () => {
  it("addNote writes the form's note to D1, trimmed", async () => {
    await addNote(form({ body: "  Ship it & say <done>  " }));
    expect(d1.state.rows).toEqual([{ id: 1, body: "Ship it & say <done>" }]);
  });

  it("addNote ignores an empty note", async () => {
    await addNote(form({ body: "   " }));
    await addNote(new FormData());
    expect(d1.state.rows).toEqual([]);
    expect(d1.state.calls).toEqual([]);
  });

  it("removeNote deletes the note the button names, and nothing for an id that is not one", async () => {
    await addNote(form({ body: "a" }));
    await addNote(form({ body: "b" }));
    await removeNote(form({ id: "1" }));
    expect(d1.state.rows).toEqual([{ id: 2, body: "b" }]);
    for (const id of ["", "0", "-2", "1.5", "x", "2 OR 1=1"]) await removeNote(form({ id }));
    expect(d1.state.rows).toEqual([{ id: 2, body: "b" }]);
  });
});
