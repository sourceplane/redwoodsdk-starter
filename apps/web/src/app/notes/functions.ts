"use server";

import { env } from "cloudflare:workers";

import { deleteNote, insertNote, normalizeNote } from "@/app/notes/db";

// Server functions: the page's forms call them over RSC RPC, and RedwoodSDK
// re-renders the page with the result, so the list below them is read back
// from D1 after every change.

export async function addNote(formData: FormData) {
  const body = normalizeNote(formData.get("body"));
  if (body !== null) await insertNote(env.DB, body);
}

export async function removeNote(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await deleteNote(env.DB, id);
}
