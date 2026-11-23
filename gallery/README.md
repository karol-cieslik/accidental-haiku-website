# Accidental Haiku curated gallery (prototype)

This static gallery is a **pre-launch prototype** under /gallery/. The repository's root /index.html is the extension's published privacy policy and MUST remain intact until a deliberate migration and updated Chrome Web Store URL.

- The gallery loads only entries from ./approved.json, currently [].
- The sample is explicitly labelled as an authored illustration, not a reader submission.
- No submission form, analytics, backend or email service is active.
- Untrusted poem text is inserted using text nodes rather than HTML interpolation. Source URLs are restricted to bare HTTP(S) URLs without credentials, fragments or query parameters.
- The submission policy is an **unapproved draft**. Provide the real controller contact, hosting/processor disclosure, retention periods, consent/lawful-basis assessment, rights review and takedown procedure before accepting submissions.

## Preview

From repository root: `python -m http.server 8755` then open http://localhost:8755/gallery/

## Manually publishing an approved entry

Add a JSON object to ./approved.json:

```json
{
  "id": "unique-safe-slug",
  "lines": ["Original first line", "Original second line", "Original third line"],
  "sourceTitle": "Source title / author",
  "sourceUrl": "https://public.example/article",
  "rightsNote": "Documented public-domain / valid license / authorization evidence",
  "discoveredAt": "2026-11-23",
  "publishedAt": "2026-11-24",
  "sourcePublishedAt": null
}
```

Before adding: independently verify 5/7/5 syllables; verify consecutive original text; verify license or permission; check for personal/sensitive text; verify source and attribution; ensure no unrelated material in URL; save approval evidence privately outside the public repository. This static view's client-side checks do NOT establish copyright clearance or independently check syllables.

## Release gates

Do not enable submissions until extension testing, user interest, legal/privacy review and a private moderation route are complete. The extension project roadmap is in `Accidental-Haiku/docs/COMMUNITY_GALLERY_ROADMAP.md` (draft PR #2).

## Low-cost manual moderation (no backend)

The first 10–20 real entries can be handled entirely by a private email inbox or another separately configured contact route, without public submissions or a database. Do **not** publish the submitter's email address, the original private message, or unreviewed content in this repository.

1. Receive the user's deliberately sent proposal via a contact route that has its own accurate privacy notice.
2. Independently check that the source page is public, wording remains verbatim, syllables total 5/7/5, no personal data appears, and publication rights are established. Request legal review where needed.
3. Store the **private** moderation record outside this public repository.
4. Create a local JSON file with only the approved public fields shown above.
5. Run `node gallery/add-approved.mjs path/to/local-reviewed.json --approve`.
6. Run `node gallery/validate.mjs` and inspect the diff before merging. The CLI checks structure only; the human must check syllables and rights.
7. For takedown, remove the entry from `approved.json`, commit, publish, and verify caches/search indexing; handle private records according to the retention policy.

The contact address is intentionally unspecified; no inbox is configured or receiving submissions yet.

## Confirmed zero-cost data and hosting direction (23 November 2026)

**Primary reference documents in the private extension repository**:
- [Zero-cost architecture](https://github.com/karol-cieslik/Accidental-Haiku/blob/docs/community-gallery-roadmap/docs/GALLERY_ZERO_COST_ARCHITECTURE.md)
- [Codex handover for 24 Nov 2026](https://github.com/karol-cieslik/Accidental-Haiku/blob/docs/community-gallery-roadmap/docs/CODEX_HANDOVER_2026-11-24.md)
- [Revised community roadmap](https://github.com/karol-cieslik/Accidental-Haiku/blob/docs/community-gallery-roadmap/docs/COMMUNITY_GALLERY_ROADMAP.md)

**Public repo note:** These private-repository links require owner access. Keep all public-facing website policy text self-contained; never make visitors follow private references.

- Website stays a **static GitHub Pages project** at `/gallery/` under the existing public site; the intended Pages address must be verified once deployed.
- **Recurring cost target: €0.** No paid domain, database, storage plan, tracking service or server.
- **Implemented on this draft branch:** optional `discoveredAt` (date of discovery, if trustworthy), `publishedAt` (gallery first publication date), and `sourcePublishedAt` (verified original article date, otherwise omitted or `null`). All three use strict `YYYY-MM-DD` dates; unknown dates are not inferred from Git history. Shared validation protects the curator CLI and browser gallery. Six Node regression tests cover dates and privacy allowlisting.
- Preserve original webpage URL and title even if it goes offline, but do not imply that lost sources remain independently verifiable or republish text without adequate rights.
- **No screenshots** or stored poem-card images. Create downloadable/shareable cards locally on request.
- No automatic source-page archiving. Do not publish user email, private moderation records or unapproved text in `approved.json` or Git history.
- Ads: **future separate decision only**, after verified users, meaningful editorial value, rights review, and reassessment of GitHub Pages commercial-use limits. No ad SDK, ad tags or analytics in this PR.
- Initial publications are manually approved with the offline curator workflow. There is **no public receiving endpoint**.

**Codex next action:** review and browser-test the **already implemented** optional date fields, preserve all data and the root privacy URL, and verify the public address. Do not claim the gallery is live until deployment is independently confirmed.
