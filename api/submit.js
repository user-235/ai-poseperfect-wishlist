// api/submit.js  — runs on Vercel's servers, never exposed to browser
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    first_name, last_name, email, role,
    excited_features, excitement_rating,
    message, device, heard_from
  } = req.body;

  // Basic server-side validation
  if (!first_name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Keys are read from Vercel environment variables — never in source code
  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/wishlist_responses`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({
      first_name, last_name, email, role,
      excited_features, excitement_rating,
      message, device, heard_from
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ error: text });
  }

  return res.status(200).json({ success: true });
}