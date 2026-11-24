import { validEntry, safeSource, dateLabels } from "./data.js";
// Public display only: this module NEVER accepts a submission or uploads browsing data.
const output = document.querySelector("#gallery");
const status = document.querySelector("#status");
const count = document.querySelector("#count");
function element(tag, cls, content) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (content !== undefined) node.textContent = content;
  return node;
}
function draw(row) {
  const article = element("article", "poem-card");
  const label = element("span", "tiny-label", "Found on the internet");
  const quote = element("blockquote");
  row.lines.forEach((line, index) => {
    if (index) quote.append(document.createElement("br"));
    quote.append(document.createTextNode(line));
  });
  const src = element("p", "source", row.sourceTitle);
  const dates = dateLabels(row);
  const metadata = dates.length ? element("div", "date-metadata") : null;
  if (metadata) for (const [label, date] of dates) {
    const detail = element("span", "date-item");
    detail.append(document.createTextNode(label + " "));
    const time = element("time", null, new Intl.DateTimeFormat("en", {
      dateStyle: "medium", timeZone: "UTC",
    }).format(new Date(date + "T00:00:00Z")));
    time.dateTime = date;
    detail.append(time);
    metadata.append(detail);
  }
  const footer = element("div", "card-footer");
  const source = element("a", null, "View original source");
  source.href = safeSource(row.sourceUrl).href;
  source.rel = "noopener noreferrer";
  source.target = "_blank";
  const share = element("button", "share", "Share");
  share.type = "button";
  share.addEventListener("click", async () => {
    const text = row.lines.join("\n") + "\n\nSource: " + row.sourceUrl;
    if (navigator.share) {
      try { await navigator.share({ title: "Accidental Haiku", text }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(text); share.textContent = "Copied"; }
    catch { share.textContent = "Copy unavailable"; }
  });
  footer.append(source, share);
  article.append(label, quote, src);
  if (metadata) article.append(metadata);
  article.append(footer);
  return article;
}
async function load() {
  try {
    const response = await fetch("./approved.json", { cache: "no-store" });
    if (!response.ok) throw Error("Unable to load entries");
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.every(validEntry)) throw Error("Invalid curated entries");
    const seen = new Set();
    const unique = rows.filter(row => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
    unique.forEach(row => output.append(draw(row)));
    count.textContent = unique.length + (unique.length === 1 ? " discovery" : " discoveries");
    if (unique.length === 0) {
      status.hidden = false;
      status.textContent = "The gallery is being prepared. No reader submissions have been published yet; the sample below shows the intended presentation.";
    }
  } catch {
    count.textContent = "Unavailable";
    status.hidden = false;
    status.textContent = "The collection is temporarily unavailable.";
  } finally { output.setAttribute("aria-busy", "false"); }
}
load();
