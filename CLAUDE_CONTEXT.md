# Project Context for Claude Code

> **Status snapshot — 2026-09-15:** `main`, deployed version **v1.8.7**. Pushed and
> live on Vercel (auto-deploys from `main`); Luis tests via the Vercel preview since he can't run
> the app locally. See "Pending tasks" near the bottom for what's still open.

## Who I am
My name is Luis Davila (davila-luis1@aramark.ca). I'm building a proof of concept for an enterprise initiative called **Initiative 4: Enterprise Knowledge and SharePoint Cleanup Tool** at Aramark. The goal is to use AI to detect duplicate files, outdated documents, and naming chaos in our document libraries.

---

## What this project is
A web app called **Drive Intelligence** that:
1. Takes a public Google Drive folder URL **or** a SharePoint Excel export
2. Fetches file metadata (name, type, size, dates, author, folder path)
3. Sends metadata to OpenAI (gpt-4o-mini) for AI analysis
4. Displays recommendations: duplicates, outdated files, cleanup actions
5. Allows downloading the results as JSON

---

## Current deployment (PoC phase)

| Layer | Platform | URL |
|---|---|---|
| Frontend (HTML) | GitHub Pages | https://luisdavila7.github.io/drive-intelligence/ |
| API Proxy | Vercel (serverless) | https://drive-intelligence-steel.vercel.app |
| Source code | GitHub | `luisdavila7/drive-intelligence` |

The app is a **single file** (`index.html`) with no framework and no build step.

### Dual-mode architecture
The app detects its environment at runtime:
- **On Vercel** (`HAS_PROXY = true`): All API calls go through `/api/analyze` and `/api/drive` serverless proxy routes. API keys live in Vercel environment variables — never in the browser.
- **On GitHub Pages** (`HAS_PROXY = false`): Falls back to direct API calls using keys stored in `localStorage` via the `setKeys()` console helper.

### API key management
- Keys are **never** in the source code or visible in the browser UI
- **Vercel (shared link):** Keys stored as Vercel environment variables `OPENAI_API_KEY` and `DRIVE_API_KEY` — fully server-side
- **GitHub Pages (dev/fallback):** Set once via browser console: `setKeys('drive-key', 'openai-key')`

---

## Current feature set (v1.8.7)

- Google Drive recursive folder scan with subfolder path tracking (UI-labeled "FileFolder")
- SharePoint Excel export import (`.xlsx` / `.xls`) — client-side parsing with SheetJS
- AI analysis via OpenAI `gpt-4o-mini` (UI-labeled "EngineAI") with editable prompt
- Collapsible prompt editor: textarea hidden by default, toggle row with Edit/Hide, "custom" badge when edited from default text (v1.8.1)
- Metadata table: Name, Folder, Type, Size, Last Modified, Author, Signals
- Version signals and +1yr age detection
- Markdown rendering of AI output
- JSON download (metadata + full report)
- AI token-limit warning banner (yellow >500 files, red >1200 files)
- Auto-truncation at 1200 files to avoid token-limit API errors
- **Dashboard v2** (v1.7.0): metadata charts (storage by file type, files created per month, files per folder — no AI needed) + structured AI dashboard (Action Breakdown donut, duplicate group stat tiles, action totals panel, Flagged Files table). AI prompt upgraded to `[ANALYSIS]+[JSON]` format with a parser that splits narrative from JSON; `max_tokens` raised to 2500; falls back to a keyword-count chart if AI returns free text only.
- **File Comparison module** (v1.8.0): "Compare Files" slide-in panel; accepts PDF/DOCX (max 500 KB each); text extracted client-side with PDF.js / mammoth.js, capped at 4,000 chars/file; AI prompt returns RECOMMENDATION / DIFFERENCES / REASONING / VERDICT sections rendered as a styled result card; drag-and-drop + click-to-browse; reuses the existing `/api/analyze` proxy.
- Robust error handling: all fetch error paths read the response as text first and only attempt `JSON.parse`, so non-JSON responses (e.g. Vercel "Forbidden." or rate-limit text) display instead of crashing.

- **Action Totals drill-down** (v1.8.3): each row in the dashboard's "Action Totals" (Keep/Review/Archive/Delete) is clickable — filters the Flagged Files table below to just that action, retitles it with a count, and can be cleared via "Show all". Pure front-end filter over the existing `aiData.actions` list; no prompt or backend changes.
- **Action count fix** (v1.8.4): Action Totals / donut counts are now computed client-side from `aiData.actions` (grouped by label) plus `files.length - actions.length` for Keep, instead of trusting the AI's self-reported `stats` block. Root cause: on larger file sets the AI's own aggregate `stats` numbers drifted from its own `actions` list and didn't sum to the true file count (e.g. one real run: `stats` said Delete 20/Review 12 while only 6+6 files were actually tagged, summing to 32 instead of 107 total files). The model can't reliably self-tally counts across dozens of items — counts are now derived deterministically from data already in the response.
- **Pre-computed duplicate clusters** (v1.8.5): before calling the AI, `detectCandidateClusters()` groups files client-side by folder + file type + modified calendar day, flags sub-groups sharing a byte-identical timestamp as near-certain duplicates, and computes oldest/newest per cluster. This block is appended to the prompt so the AI judges pre-built candidates instead of pattern-matching cold across the raw file list. Root cause found via manual audit of a real 107-file run: the AI missed an exact-timestamp duplicate trio entirely, returned an incomplete 7/9 file duplicate group, left 11 of 12 files in an obvious same-day screenshot cluster unassessed, and called the *newest* file in a 7-file build cluster "outdated" (the actual oldest was never mentioned) — LLMs are unreliable at this kind of cross-item comparison/date-sorting done silently over dozens of rows. The default prompt (`index.html`'s embedded `#user-prompt` textarea) was rewritten to consume these clusters as ground truth, and the JSON contract dropped the unreliable self-reported `stats` field entirely (now redundant given v1.8.4) and added a `reason` field to `duplicate_groups`.

- **Keep drill-down fix** (v1.8.6): clicking the "Keep" row in Action Totals showed an empty table. Root cause: `aiData.actions` only ever contains files the AI explicitly flagged (Review/Archive/Delete) — the Keep tile's count was always correct arithmetic (`files.length - actions.length`) but had zero real file records behind it, since the AI never emits "Keep" rows itself. Fixed by synthesizing a `{ action: 'Keep', reason: 'No issues detected.' }` entry for every file not present in `aiData.actions`, so the drill-down and "Show all" now reflect every file, not just the flagged ones.
- **SharePoint date parser fix** (v1.8.6): `processSharePointFile()`'s "Modified" column parser only recognized a native Excel date/time value or a `DD/MM/YYYY H:MM` text string. A real SharePoint export (`SampleData_Demo_1.xlsx`) stores "Modified" as **text** in `YYYY-MM-DD HH:MM:SS` format, which matched neither case — every row silently got `modifiedTime: null`, which in turn disabled `isOld()` age-tagging and `detectCandidateClusters()` entirely (both require a real date) for that whole run, forcing the AI to fall back to guessing rather than judging pre-computed ground truth. Parser now also matches the `YYYY-MM-DD HH:MM[:SS]` format. Verified against the real file: 0/192 rows parsed before the fix, 192/192 after, and cluster detection went from 0 to 19 real clusters (including two 46-file near-duplicate folder trees, `Categories` and `Categories_1`, invisible to the AI before).

- **Cross-folder duplicate detection** (v1.8.7): `detectCandidateClusters()` only ever compares files *within the same folder*, so it could never catch the same file existing verbatim in a *different* folder — e.g. a whole folder tree copy-pasted elsewhere. Luis tested this directly by duplicating a real folder (`Categories` → `Categories_1`, 46 identically-named/identically-timestamped files) and confirmed the AI never mentioned it. Added `detectCrossFolderDuplicates()`: groups files by filename across the *entire* file list regardless of folder, keeps only names appearing in 2+ distinct folders, and rolls up any folder pair sharing 5+ identical names into one "likely a duplicated folder" finding (below that threshold, reported as individual cross-folder file pairs) rather than dozens of one-off entries. Fed to the prompt via `formatCrossFolderDuplicatesForPrompt()` as a third ground-truth block, and the default prompt/JSON-contract rules were updated to reference it alongside the existing same-folder clusters. Verified against Luis's real data: correctly surfaced the 46-file `Categories`/`Categories_1` overlap as one "likely a duplicated folder" finding (46/46 exact timestamp matches) and the pre-existing single-file `Meridian Menu Pricing.xlsx` cross-folder duplicate as a separate, non-rolled-up entry.

**Note on rebrand (v1.8.2):** "OpenAI" → "EngineAI" and "Google Drive" → "FileFolder" is a **UI-text-only** rebrand — 20 visible strings changed (header, badges, labels, alerts, status/error messages). Code internals (variable names, API URLs, localStorage keys, JS comments, `setKeys()` hints) are untouched and still reference OpenAI/Drive under the hood.

---

## Tech stack (PoC)

| Component | Technology |
|---|---|
| Frontend | Pure HTML/CSS/JS — single file, no framework |
| Hosting | GitHub Pages (HTML) + Vercel (API proxy) |
| Drive API | Google Drive API v3 |
| AI | OpenAI gpt-4o-mini |
| SharePoint input | SheetJS (xlsx v0.18.5, CDN) — browser-side Excel parsing |
| Key storage | Vercel env vars (prod) / localStorage (dev) |

---

## Planned production architecture (Azure)

When the corporate blockers are resolved (SharePoint direct access, Azure OpenAI approval), the PoC migrates to a full Azure stack:

```
Aramark user (SSO)
        │
        ▼
Azure Static Web Apps          ← replaces GitHub Pages
        │
        ▼
Azure Functions (backend)      ← replaces Vercel proxy
        │
   ┌────┴────────────────┐
   │                     │
   ▼                     ▼
Microsoft Graph API    Azure OpenAI Service
(SharePoint direct)    (corporate-approved, data stays in tenant)
        │
   Azure AD (auth)      ← replaces manual setKeys(), SSO with Aramark credentials
```

### Why Azure for production

| Need | Azure solution | Advantage over current PoC |
|---|---|---|
| Authentication | Azure AD / Entra ID | SSO with Aramark credentials, no setup for users |
| SharePoint access | Microsoft Graph API | Real-time, no manual Excel export needed |
| AI | Azure OpenAI Service | Data stays in Aramark's tenant, corporately approved |
| Backend | Azure Functions | Already inside Aramark's Azure tenant |
| Frontend | Azure Static Web Apps | Integrated with AD, CI/CD built-in |
| Logging | Azure Monitor + App Insights | Usage evidence for business case |

### Migration path from PoC to production

1. **PoC (now):** GitHub Pages + Vercel proxy + OpenAI direct + manual SharePoint export
2. **Phase 2:** Azure Static Web Apps + Azure Functions + OpenAI direct (get Azure approval)
3. **Phase 3:** Add Azure AD authentication (SSO)
4. **Phase 4:** Replace SharePoint export with Microsoft Graph API live connection
5. **Phase 5:** Switch OpenAI to Azure OpenAI Service (data sovereignty)
6. **Phase 6:** Add usage logging to Azure Monitor (evidence base for funding)

---

## Business context

This is a PoC to demonstrate value and build a business case for:
- Full SharePoint library access via Microsoft Graph API
- Internal Azure OpenAI API approval
- Broader AI initiative funding

Every usage, duplicate found, and recommendation made should eventually be logged (Azure Monitor) to build the evidence base for Initiative 4.

---

## Known limitations of the PoC

- **Token limit:** gpt-4o-mini has a 128k token context. Lists over ~1200 files are auto-truncated. Warning banner shown at 500+ files.
- **SharePoint:** Input is a manual Excel export, not live. A `.iqy` web query file requires SharePoint OAuth (blocked by corporate IT).
- **Google Drive:** Only works with publicly shared folders (API key restriction). Private/org-restricted folders require OAuth.
- **No authentication:** Anyone with the Vercel link can use Luis's API keys. Acceptable for PoC testing; requires Azure AD for production.
- **No usage logging:** API costs are not tracked in the PoC. Needed before broad rollout.

---

## Vercel proxy setup

### Environment variables required in Vercel dashboard:
| Variable | Value |
|---|---|
| `OpenAIAPIKey` | sk-... (your OpenAI key) |
| `DriveAPIKey` | AIza... (your Google Drive API key) |

### API routes (serverless functions in `/api/`):
- `GET /api/drive?folderId=XXX` — proxies Google Drive API v3 folder listing
- `POST /api/analyze` — proxies OpenAI chat completions

### To update keys after deployment:
Go to Vercel dashboard → Project → Settings → Environment Variables → Edit → Redeploy.

---

## Working rules (how Claude must behave in this project)

1. **Plan before coding.** Before making any code change, Claude presents a written plan describing what will be built and how. No code is written until Luis explicitly approves the plan.

2. **Claude writes its own prompts.** Claude builds its own internal prompts and reasoning based on the information Luis provides. Luis gives direction and context; Claude translates that into implementation decisions.

3. **Language.** Luis writes in Spanish. Claude always responds in English — no exceptions.

4. **Commit + push, don't wait for local testing.** Luis cannot run this app locally — he tests exclusively via the Vercel preview deploy. Once a change is approved and verified (JS parses cleanly, logic sanity-checked against real data when possible), commit and push to `main` directly so Vercel redeploys; don't leave changes uncommitted waiting for a local test that won't happen.

5. **Version bump on every meaningful change.** Bump the patch version (header badge `.header-badge` + footer `.footer` in `index.html`, and the "Current feature set" heading here) on every feat/fix commit, per the global version-tracking rule.

---

## Recent session log (most recent first)

- **2026-09-15 — v1.8.7, cross-folder duplicate detection.** After verifying v1.8.6 on the Vercel preview, Luis noticed the AI still didn't flag a folder he'd deliberately duplicated (`Categories` → `Categories_1`, 46 files, identical names and timestamps) as a duplicate. Root cause: `detectCandidateClusters()` only ever groups files within the *same* folder — it structurally cannot catch the same file existing in a *different* folder. Added a second, complementary detector (`detectCrossFolderDuplicates()`) that groups by filename across the whole list regardless of folder, and rolls up folder pairs sharing 5+ identical names into one "likely a duplicated folder" finding. Verified against Luis's real data before pushing: correctly identified the 46-file overlap as one finding (46/46 exact timestamp matches).
- **2026-09-14 — v1.8.6, Keep drill-down + SharePoint date parser fix.** Luis reported that clicking "Keep" in Action Totals showed an empty Flagged Files table, and shared a real AI run (`SampleData_Demo_1.xlsx`, 192-file SharePoint export). Two bugs found and fixed:
  1. **Keep drill-down** — `aiData.actions` only ever contains flagged files (Review/Archive/Delete); Keep's tile count was correct arithmetic but had no real per-file records behind it, so filtering by "Keep" always returned zero rows. Fixed by synthesizing a Keep entry for every file not present in `aiData.actions`.
  2. **SharePoint date parser** — cross-checking the shared JSON against the actual Excel (read directly by unzipping the `.xlsx` and inspecting `sharedStrings.xml`/`sheet1.xml`, since it couldn't be uploaded) showed every one of the 192 rows had `modifiedTime: null`. The "Modified" column is exported as **text** in `YYYY-MM-DD HH:MM:SS` format, which the parser didn't recognize (it only handled native Excel dates or `DD/MM/YYYY H:MM` text) — every row silently fell back to `null`, which disabled `isOld()` age-tagging and `detectCandidateClusters()` for that whole run (both require a real date), forcing the AI to guess instead of judging pre-computed ground truth (it hallucinated a duplicate group and "[OLDER THAN 1 YEAR]" reasons that were never in its actual prompt input). Fixed by extending the parser to also match `YYYY-MM-DD HH:MM[:SS]`. Verified: 0/192 → 192/192 dates parsed, cluster detection 0 → 19 clusters (found two 46-file near-duplicate folder trees, `Categories`/`Categories_1`, previously invisible to the AI).
  - A "reload a previously-downloaded JSON report into the dashboard" feature was proposed but explicitly declined by Luis — not pursued.
- **2026-09-13 — v1.8.5, pre-computed duplicate clusters.** Luis shared a real AI analysis run (107-file synthetic SharePoint dataset, `SampleData.xlsx`) and flagged that only 32 of 107 files were reflected in the dashboard. Investigation found two separate AI-reliability bugs:
  1. The AI's self-reported `stats` block didn't even match its own `actions` array, and didn't sum to the true file count → fixed in **v1.8.4** by deriving Keep/Review/Archive/Delete counts client-side from `aiData.actions` + `files.length` instead of trusting the AI's arithmetic.
  2. A manual audit of the same 107-file run found the AI missed an exact-timestamp duplicate trio entirely, returned an incomplete duplicate group (7/9 files), left 11/12 files of an obvious same-day screenshot cluster unassessed, and called the *newest* file in a build cluster "outdated" → fixed in **v1.8.5** by adding `detectCandidateClusters()` (groups files by folder + type + modified day, flags identical-timestamp sub-groups, computes oldest/newest) and rewriting the default AI prompt to consume these as ground truth rather than discovering patterns cold. Verified against the real dataset before pushing.
  - The `stats` field was dropped from the JSON contract entirely (redundant now that v1.8.4 computes it client-side).
  - See [ai-response-reliability-pattern.md](../../.claude/projects/) memory (per-project, not in this repo) for the general principle established here: don't ask the AI to compute/discover anything the frontend can determine deterministically.
- **2026-09-12 — v1.8.3, Action Totals drill-down.** Made each row in the dashboard's Action Totals clickable to filter the Flagged Files table by that action (pure front-end, no prompt changes). This is what surfaced the v1.8.4 bug — clicking "Review" showed fewer rows than the tile's count.
- **2026-09-12 — bootstrap.** First session in this thread: created `.claude/settings.json` (project-level Bash-allow config, was missing) and refreshed this file's "Current feature set" section from a stale v1.5.0 to the actual v1.8.2, after confirming both bootstrap files' state.

## Pending tasks

- **Luis to verify v1.8.7 on the Vercel preview:** re-run `SampleData_Demo_1.xlsx` and confirm the AI's narrative/`duplicate_groups` now explicitly call out `Categories`/`Categories_1` as a duplicated folder.
- No other code changes in flight as of this snapshot.
