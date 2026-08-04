# Drive Intelligence — File Analysis with Claude

A web app that connects Google Drive folders to Claude AI for intelligent document analysis. Built as a proof of concept for Initiative 4: Enterprise Knowledge Cleanup.

## What it does

1. Paste a public Google Drive folder link
2. The app fetches all file metadata (name, type, size, dates)
3. You edit the analysis prompt as needed
4. Claude analyzes the metadata and identifies duplicates, outdated files, and cleanup recommendations
5. Download the results as JSON

## How to deploy on GitHub Pages (free, shareable link)

### Step 1 — Create a GitHub account
Go to [github.com](https://github.com) and sign up (free).

### Step 2 — Create a new repository
- Click the **+** icon → **New repository**
- Name it: `drive-intelligence`
- Set it to **Public**
- Click **Create repository**

### Step 3 — Upload the file
- In your new repo, click **Add file → Upload files**
- Upload `index.html`
- Click **Commit changes**

### Step 4 — Enable GitHub Pages
- Go to **Settings → Pages**
- Under **Source**, select **Deploy from a branch**
- Branch: `main` / Folder: `/ (root)`
- Click **Save**

### Step 5 — Share the link
After 1-2 minutes your app will be live at:
```
https://YOUR-USERNAME.github.io/drive-intelligence
```

Share this link with your team — no installation needed, works in any browser.

## How to use

1. The Google Drive API key is pre-filled
2. Paste your shared Google Drive folder URL
3. Click **Fetch files from Drive**
4. Edit the analysis prompt if needed
5. Click **Analyze with Claude**
6. Download the JSON report

## Notes

- The Google Drive folder must be shared as "Anyone with the link can view"
- The analysis prompt can be changed at any time for different types of analysis
- Results can be downloaded as JSON for reporting
