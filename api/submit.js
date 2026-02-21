// api/submit.js — runs on Vercel's servers, keys never exposed to browser
export default async function handler(req, res) {
  // CORS headers (needed for fetch from your HTML page)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    first_name, last_name, email, role,
    excited_features, excitement_rating,
    message, device, heard_from
  } = req.body;

  // Server-side validation
  if (!first_name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: first_name, email, message' });
  }

  // Read keys from Vercel environment variables — never in source code
  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wishlist_responses`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({
        first_name,
        last_name:         last_name         || null,
        email,
        role:              role              || null,
        excited_features:  excited_features  || null,
        excitement_rating: excitement_rating || null,
        message,
        device:            device            || null,
        heard_from:        heard_from        || null
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase error:', text);
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Fetch failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
