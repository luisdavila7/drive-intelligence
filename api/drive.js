// Secure proxy for Google Drive API v3 folder listing.
// The DRIVE_API_KEY lives in Vercel environment variables — it never reaches the browser.
//
// GET /api/drive?folderId=FOLDER_ID
// Returns: { files: [...] }  (same shape as Drive API v3)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.DriveAPIKey;
  if (!apiKey) {
    return res.status(500).json({ error: 'DriveAPIKey is not set in Vercel environment variables.' });
  }

  const { folderId } = req.query;
  if (!folderId) {
    return res.status(400).json({ error: 'folderId query parameter is required.' });
  }

  try {
    const params = new URLSearchParams({
      q:         `'${folderId}' in parents and trashed=false`,
      fields:    'files(id,name,mimeType,size,modifiedTime,createdTime,owners)',
      key:       apiKey,
      pageSize:  '1000'
    });

    const upstream = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`
    );
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
