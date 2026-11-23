#!/usr/bin/env node
/**
 * Offline curator tool. Reads a rights-reviewed JSON entry and copies ONLY
 * approved public fields into the static gallery. No network or user accounts.
 *
 * Usage: node gallery/add-approved.mjs path/to/reviewed-entry.json --approve
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const file = fileURLToPath(new URL("./approved.json", import.meta.url));
const [, , input, flag] = process.argv;
if (!input || flag !== "--approve") {
  console.error("Usage: node gallery/add-approved.mjs private/reviewed.json --approve");
  console.error("Only run after independent syllable, permission and privacy checks.");
  process.exitCode = 2;
} else {
  try {
    const raw = JSON.parse(readFileSync(resolve(input), "utf8"));
    const entry = {
      id: raw.id, lines: raw.lines, sourceTitle: raw.sourceTitle,
      sourceUrl: raw.sourceUrl, rightsNote: raw.rightsNote,
    };
    if (!/^[a-z0-9-]{1,64}$/.test(entry.id)) throw Error("Invalid slug");
    if (!Array.isArray(entry.lines) || entry.lines.length !== 3 ||
        !entry.lines.every(line => typeof line === "string" && line.trim() && line.length <= 180))
      throw Error("Three valid original lines required");
    if (typeof entry.sourceTitle !== "string" || entry.sourceTitle.length > 120)
      throw Error("Source title required");
    if (typeof entry.rightsNote !== "string" || !entry.rightsNote.trim())
      throw Error("A verified publication-rights note is mandatory");
    const url = new URL(entry.sourceUrl);
    if (!["https:", "http:"].includes(url.protocol) ||
      url.username || url.password || url.search || url.hash)
      throw Error("Public source URL must omit credentials, query and fragment");
    const data = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(data) || data.some(item => item.id === entry.id))
      throw Error("Gallery is invalid or slug already published");
    data.push(entry);
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log("Added", entry.id, "to approved.json. Review the diff before merging.");
    console.log("Not a syllable, copyright or consent verifier.");
  } catch (err) {
    console.error("Refused:", err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
