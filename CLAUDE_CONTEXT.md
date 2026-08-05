# Project Context for Claude Code

## Who I am
My name is Luis. I'm building a proof of concept for an enterprise initiative called **Initiative 4: Enterprise Knowledge and SharePoint Cleanup Tool** at my company (Aramark). The goal is to use AI to detect duplicate files, outdated documents, and naming chaos in our document libraries.

## What this project is
A web app called **Drive Intelligence** — a Google Drive × Claude integrator that:
1. Takes a public Google Drive folder URL
2. Fetches file metadata via the Google Drive API (name, type, size, dates)
3. Sends that metadata to an AI (Claude or OpenAI) for analysis
4. Displays recommendations: duplicates, outdated files, cleanup actions
5. Allows downloading the results as JSON

## Current state
- App is live at: https://luisdavila7.github.io/drive-intelligence/
- Code is in GitHub repo: `luisdavila7/drive-intelligence`
- Single file app: `index.html`
- Google Drive API connection works
- AI analysis is broken — API key is hardcoded and exposed in the frontend code

## Problems to fix (priority order)

### 1. API key exposed (CRITICAL)
The Google Drive API key was hardcoded in the HTML. This has been fixed — the key is no longer in the source code. Options going forward:
- Restrict the key in Google Console to only allow `luisdavila7.github.io`
- Move to a backend proxy (Vercel serverless function)

### 2. AI connection broken
The app calls `api.anthropic.com` directly from the browser but has no valid Anthropic API key. Claude API access is pending company approval. In the meantime, I have a personal OpenAI account. Options:
- Switch to OpenAI API with my personal key (short term)
- Add a backend proxy on Vercel that holds the API key securely
- Wait for Claude API approval and add key then

### 3. Planned improvements
- The AI prompt should be editable by the user (already partially implemented)
- Results dashboard should be cleaner
- Should work for anyone on my team who visits the link
- Eventually connect to SharePoint directly (blocked by corporate IT for now)

## Tech stack
- Pure HTML/CSS/JS — single file, no framework, no build step
- Hosted on GitHub Pages (free)
- Google Drive API v3 for metadata
- Anthropic Claude API (pending) or OpenAI API (interim) for analysis

## Business context
This is a PoC to demonstrate value and build a business case for:
- Full SharePoint library access
- Internal Claude API approval
- Broader AI initiative funding

Every usage, duplicate found, and recommendation made should eventually be logged to build the evidence base.

## What I need from you (Claude Code)
1. Fix the API key exposure issue
2. Switch the AI backend to OpenAI (I will provide my API key)
3. Make the app production-ready enough to share with my team
4. Keep it as a single `index.html` file if possible — no complex build setup
5. Push changes to GitHub and verify GitHub Pages updates correctly
