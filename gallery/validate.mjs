import { validEntry } from "./data.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync(new URL("./approved.json", import.meta.url)));
assert.ok(Array.isArray(rows), "approved.json must be an array");
const seen = new Set();
for (const row of rows) {
  assert.ok(validEntry(row), "invalid public entry: " + String(row.id));
  assert.ok(!seen.has(row.id), "duplicate slug");
  seen.add(row.id);
}
const root = readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(root.includes("privacy policy"), "root Chrome Web Store privacy policy must remain");
const gallery = readFileSync(new URL("./index.html", import.meta.url), "utf8");
assert.ok(gallery.includes("Reader discoveries") && gallery.includes("not a user submission"));
const js = readFileSync(new URL("./gallery.js", import.meta.url), "utf8");
assert.ok(js.includes("createTextNode") && js.includes("textContent"));
console.log("Gallery checks passed:", rows.length, "approved entries; no collection enabled.");
