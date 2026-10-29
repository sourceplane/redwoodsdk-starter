import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { health } from "@/app/api/health";
import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  // The one route only the Worker can answer: it counts the notes in the D1
  // database behind the DB binding. The deploy's smoke reads it.
  route("/api/health", health),
  render(Document, [route("/", Home)]),
]);
