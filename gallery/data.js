/** Public gallery record validation. Shared by the browser and offline curator. */
export function validISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function optionalDate(value) {
  return value === undefined || value === null || validISODate(value);
}
export function safeSource(raw) {
  if (typeof raw !== "string" || raw.length > 2048) return null;
  try {
    const url = new URL(raw);
    if (!(url.protocol === "https:" || url.protocol === "http:")) return null;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!host.includes(".") || url.username || url.password || url.search || url.hash) return null;
    // Never publish URL metadata from an obvious private network or account app.
    // This is only a safety filter; a moderator must verify public accessibility.
    if (host.startsWith("[") || host === "localhost" ||
        /\.(?:localhost|local|internal|lan|test)$/.test(host) ||
        /^(?:127|10|0)\./.test(host) || /^192\.168\./.test(host) ||
        /^169\.254\./.test(host) ||
        /^172\.(?:1[6-9]|2\d|3[01])\./.test(host) ||
        ["mail.google.com", "outlook.live.com", "outlook.office.com",
         "web.whatsapp.com", "app.slack.com", "discord.com", "chatgpt.com",
         "chat.openai.com", "drive.google.com"].includes(host)) return null;
    return url;
  } catch { return null; }
}
const publicFields = new Set([
  "id", "lines", "sourceTitle", "sourceUrl", "rightsNote",
  "discoveredAt", "publishedAt", "sourcePublishedAt",
]);
export function validEntry(row) {
  return !!(row && typeof row === "object" && Object.keys(row).every(key => publicFields.has(key)) &&
    typeof row.id === "string" && /^[a-z0-9-]{1,64}$/.test(row.id) &&
    Array.isArray(row.lines) && row.lines.length === 3 &&
    row.lines.every(line => typeof line === "string" && !!line.trim() && line.length <= 180) &&
    typeof row.sourceTitle === "string" && !!row.sourceTitle.trim() && row.sourceTitle.length <= 120 &&
    typeof row.rightsNote === "string" && !!row.rightsNote.trim() && row.rightsNote.length <= 500 &&
    safeSource(row.sourceUrl) &&
    optionalDate(row.discoveredAt) && optionalDate(row.publishedAt) && optionalDate(row.sourcePublishedAt));
}
export function publicRecord(raw) {
  // Explicit allowlist: never copy submitted emails, IPs or private moderation metadata.
  const entry = {
    id: raw.id,
    lines: raw.lines,
    sourceTitle: raw.sourceTitle,
    sourceUrl: raw.sourceUrl,
    rightsNote: raw.rightsNote,
  };
  for (const key of ["discoveredAt", "publishedAt", "sourcePublishedAt"]) {
    if (raw[key] !== undefined && raw[key] !== null) entry[key] = raw[key];
  }
  if (!validEntry(entry)) throw new Error("Invalid approved public record; verify poem, source and rights.");
  return entry;
}
export function dateLabels(row) {
  const labels = [];
  if (validISODate(row.discoveredAt)) labels.push(["Discovered", row.discoveredAt]);
  if (validISODate(row.publishedAt)) labels.push(["Added to gallery", row.publishedAt]);
  if (validISODate(row.sourcePublishedAt)) labels.push(["Source published", row.sourcePublishedAt]);
  return labels;
}
