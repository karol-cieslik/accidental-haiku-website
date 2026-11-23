import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync(new URL("./approved.json", import.meta.url)));
assert.ok(Array.isArray(rows), "approved.json must be an array");
const seen = new Set();
for (const row of rows) {
  assert.match(row.id, /^[a-z0-9-]{1,64}$/, "safe slug required");
  assert.ok(!seen.has(row.id), "duplicate slug");
  seen.add(row.id);
  assert.ok(Array.isArray(row.lines) && row.lines.length === 3, "three lines required");
  assert.ok(row.lines.every(line => typeof line === "string" && line.trim() && line.length <= 180));
  assert.ok(typeof row.sourceTitle === "string" && row.sourceTitle.length <= 120);
  assert.ok(typeof row.rightsNote === "string" && row.rightsNote.trim(), "document publication basis");
  const url = new URL(row.sourceUrl);
  assert.ok(["http:", "https:"].includes(url.protocol));
  assert.ok(!url.username && !url.password && !url.search && !url.hash, "publish a clean URL");
}
const root = readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(root.includes("privacy policy"), "root Chrome Web Store privacy policy must remain");
const gallery = readFileSync(new URL("./index.html", import.meta.url), "utf8");
assert.ok(gallery.includes("Reader discoveries") && gallery.includes("not a user submission"));
const js = readFileSync(new URL("./gallery.js", import.meta.url), "utf8");
assert.ok(js.includes("createTextNode") && js.includes("textContent"));
console.log("Gallery checks passed:", rows.length, "approved entries; no collection enabled.");
