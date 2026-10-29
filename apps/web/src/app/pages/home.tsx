import { env } from "cloudflare:workers";

import { listNotes } from "@/app/notes/db";
import { SITE_NAME, SOURCE_URL } from "@/app/site";

import { Welcome } from "./welcome.js";

// A server component: it reads the notes from D1 on every request and hands
// them to the welcome page (a client component), whose forms call the server
// functions in app/notes/functions.ts.
export const Home = async () => {
  const notes = await listNotes(env.DB);
  return <Welcome siteName={SITE_NAME} sourceUrl={SOURCE_URL} notes={notes} />;
};
