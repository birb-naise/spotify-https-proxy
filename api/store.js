// Temporary in-memory storage (reset on serverless cold start)
let spotifyCode = null;

export default async (req, res) => {
  if (req.method === 'POST') {
    // Store code from Spotify OAuth redirect
    spotifyCode = req.query.code || req.body.code;
    res.status(200).send('Code stored!');
  } 
  else if (req.method === 'GET') {
    // Retrieve code (called by Pico)
    res.status(200).json({ code: spotifyCode });
  }
};
