const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

async function getToken() {
  const creds = Buffer.from(
    `ff9d6baaac3b42b3820f281f4cef214e:e2e64a6ec1f34c2e93993145a1569327`
  ).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ error: 'No query' });
  try {
    const token = await getToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type || 'track'}&limit=7`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}