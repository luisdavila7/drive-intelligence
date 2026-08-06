# Drive Intelligence — File Analysis with Claude

A web app that connects Google Drive folders to Claude AI for intelligent document analysis. Built as a proof of concept for Initiative 4: Enterprise Knowledge Cleanup.

## What it does

1. Paste a public Google Drive folder link
2. The app fetches all file metadata (name, type, size, dates)
3. You edit the analysis prompt as needed
4. Claude analyzes the metadata and identifies duplicates, outdated files, and cleanup recommendations
5. Download the results as JSON

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
