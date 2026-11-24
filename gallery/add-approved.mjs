#!/usr/bin/env node
import { publicRecord, validEntry } from "./data.js";
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
    const entry = publicRecord(raw);
    const data = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(data) || !data.every(validEntry) || data.some(item => item.id === entry.id))
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
