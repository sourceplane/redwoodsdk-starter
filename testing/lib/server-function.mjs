#!/usr/bin/env node
// Call one of the page's server functions over HTTP, as RedwoodSDK's own
// client does: the function's id (`<module>#<export>`) is read out of the
// build's client bundle, where the "use server" transform registered it, and
// its argument (one FormData) is encoded with React's own reply encoder — the
// copy the app depends on — so the wire format is never hand-written here.
// The request is RedwoodSDK's action request: a POST to `/?__rsc&
// __rsc_action_id=<id>` from the app's own origin (it refuses any other).
//
// Run from the built app's directory (apps/web), so the build and
// react-server-dom-webpack resolve:
//   node server-function.mjs <base-url> <exportedName> key=value [key=value …]
// Prints the HTTP status; exits non-zero on anything but 200.
// SERVER_FUNCTION_ORIGIN, when set, is sent as the Origin instead — what a
// page on another site would send.
import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

const [base, name, ...pairs] = process.argv.slice(2);
if (!base || !name) {
  console.error("usage: server-function.mjs <base-url> <exportedName> key=value …");
  process.exit(2);
}
const assets = path.resolve("dist/client/assets");
const ref = new RegExp("[`\"']([^`\"']+\\.(?:ts|tsx|js|jsx))[`\"'],\\s*[`\"']" + name + "[`\"']");
let id = null;
for (const file of fs.readdirSync(assets).filter((f) => f.endsWith(".js"))) {
  const m = ref.exec(fs.readFileSync(path.join(assets, file), "utf8"));
  if (m) {
    id = `${m[1]}#${name}`;
    break;
  }
}
if (!id) {
  console.error(`server-function: no server function named ${name} in the build's client bundle`);
  process.exit(1);
}
const require = createRequire(`${process.cwd()}/package.json`);
const { encodeReply } = require("react-server-dom-webpack/client.edge");
const form = new FormData();
for (const pair of pairs) {
  const i = pair.indexOf("=");
  form.set(pair.slice(0, i), pair.slice(i + 1));
}
const url = new URL("/", base);
url.searchParams.set("__rsc", "");
url.searchParams.set("__rsc_action_id", id);
const response = await fetch(url, {
  method: "POST",
  headers: { Origin: process.env.SERVER_FUNCTION_ORIGIN || url.origin },
  body: await encodeReply([form]),
});
console.log(response.status);
process.exit(response.status === 200 ? 0 : 1);
