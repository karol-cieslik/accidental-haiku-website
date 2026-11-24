import assert from "node:assert/strict";
import { test } from "node:test";
import { dateLabels, optionalDate, publicRecord, safeSource, validEntry, validISODate } from "./data.js";

const source = {
  id: "verified-example",
  lines: ["The cold moon hangs low.", "A small bird sleeps in the reeds.", "Dawn slips through the mist."],
  sourceTitle: "Test-only original work", sourceUrl: "https://example.org/public",
  rightsNote: "Illustration for validation; not to be published as a reader submission",
};
test("backward compatible with entries without dates", () => {
  assert.equal(validEntry(source), true);
  assert.deepEqual(dateLabels(source), []);
});
test("validates genuine ISO calendar dates, including leap days", () => {
  assert.equal(validISODate("2024-02-29"), true);
  for (const date of ["2026-02-29", "2026-13-01", "2026-00-01", "2026-04-31", "2026-11-23T12:00:00Z", "2026-1-1", "", 20261123]) {
    assert.equal(validISODate(date), false, String(date));
  }
  assert.equal(optionalDate(null), true);
  assert.equal(optionalDate(undefined), true);
});
test("supports three independent optional dates", () => {
  const row = { ...source, discoveredAt: "2026-11-23", publishedAt: "2026-11-24", sourcePublishedAt: "2026-11-01" };
  assert.equal(validEntry(row), true);
  assert.deepEqual(dateLabels(row).map(([label]) => label), ["Discovered", "Added to gallery", "Source published"]);
  assert.equal(validEntry({ ...row, sourcePublishedAt: "2026-11-31" }), false);
});
test("does not expose private submission properties to public gallery", () => {
  const raw = { ...source, publishedAt: "2026-11-24", submitterEmail: "private@example.com", token: "secret", internalNotes: "do not publish" };
  assert.equal(validEntry(raw), false);
  const row = publicRecord(raw);
  assert.equal(row.submitterEmail, undefined);
  assert.equal(row.internalNotes, undefined);
  assert.equal(row.token, undefined);
  assert.equal(row.publishedAt, "2026-11-24");
});
test("accepts only bare public-looking HTTP(S) references", () => {
  for (const url of ["javascript:alert(1)", "file:///tmp/private", "https://example.org/x?token=secret", "https://example.org/x#private", "https://name:pass@example.org", "http://localhost/foo", "http://127.0.0.1/a", "http://192.168.1.4/", "http://10.0.0.1/", "http://172.16.4.1/", "https://notes.local/x", "https://mail.google.com./mail/", "https://mail.google.com/mail/u/0", "https://example.org"]) {
    assert.equal(!!safeSource(url), url === "https://example.org", url);
  }
});
test("enforces rights note and limited poem structure", () => {
  assert.equal(validEntry({ ...source, rightsNote: "" }), false);
  assert.equal(validEntry({ ...source, lines: ["only one line"] }), false);
  assert.equal(validEntry({ ...source, sourceUrl: "https://example.org/?private=yes" }), false);
});
