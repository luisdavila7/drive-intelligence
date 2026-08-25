# Project Context for Claude Code

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

## Current feature set (v1.5.0)

- Google Drive recursive folder scan with subfolder path tracking
- SharePoint Excel export import (`.xlsx` / `.xls`) — client-side parsing with SheetJS
- AI analysis via OpenAI `gpt-4o-mini` with editable prompt
- Metadata table: Name, Folder, Type, Size, Last Modified, Author, Signals
- Version signals and +1yr age detection
- Markdown rendering of AI output
- JSON download (metadata + full report)
- AI token-limit warning banner (yellow >500 files, red >1200 files)
- Auto-truncation at 1200 files to avoid token-limit API errors

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
