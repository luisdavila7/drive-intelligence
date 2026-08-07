// Secure proxy for OpenAI chat completions.
// The OPENAI_API_KEY lives in Vercel environment variables — it never reaches the browser.
//
// POST /api/analyze
// Body: { model, max_tokens, messages }  (same shape as OpenAI's API)

export default async function handler(req, res) {
  // CORS — allow the Vercel frontend and GitHub Pages (dev fallback)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set in Vercel environment variables.' });
  }

  try {
    const { model = 'gpt-4o-mini', max_tokens = 1500, messages } = req.body;

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, max_tokens, messages })
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
