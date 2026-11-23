// Public display only: this module NEVER accepts a submission or uploads browsing data.
const output = document.querySelector("#gallery");
const status = document.querySelector("#status");
const count = document.querySelector("#count");
function safeSource(raw) {
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    return url;
  } catch { return null; }
}
function valid(row) {
  return row && typeof row.id === "string" && /^[a-z0-9-]{1,64}$/.test(row.id) &&
    Array.isArray(row.lines) && row.lines.length === 3 &&
    row.lines.every(line => typeof line === "string" && line.trim() && line.length <= 180) &&
    typeof row.sourceTitle === "string" && row.sourceTitle.length <= 120 &&
    typeof row.rightsNote === "string" && row.rightsNote.trim() &&
    safeSource(row.sourceUrl);
}
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
  article.append(label, quote, src, footer);
  return article;
}
async function load() {
  try {
    const response = await fetch("./approved.json", { cache: "no-store" });
    if (!response.ok) throw Error("Unable to load entries");
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.every(valid)) throw Error("Invalid curated entries");
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
