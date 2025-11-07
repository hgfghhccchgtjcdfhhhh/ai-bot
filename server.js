// server.js — minimal Express backend that forwards to HG Bot
// Usage: npm init -y
//        npm i express dotenv node-fetch cors
//        node server.js
//
// If you run Node 18+ you have global fetch; if not, node-fetch is used below.

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // serve index.html and index.js from root (for quick demo)

const HG_API_KEY = process.env.HG_API_KEY;
const HG_API_URL = process.env.HG_API_URL || 'https://api.hg-bot.ai/v1/chat'; // replace if your provider uses another URL

if (!HG_API_KEY) {
  console.warn('Warning: HG_API_KEY not set in .env — server will reject chat calls until you add it.');
}

app.get('/health', (req, res) => res.send('ok'));

// /chat expects { message: "..." }
app.post('/chat', async (req, res) => {
  if (!HG_API_KEY) return res.status(500).json({ error: 'Server missing HG_API_KEY' });

  const userMessage = (req.body && req.body.message) ? String(req.body.message) : '';
  if (!userMessage) return res.status(400).json({ error: 'Empty message' });

  try {
    // Build payload depending on the provider. Most simple chat APIs accept
    // a JSON body with the messages or input text. Adjust as needed.
    const payload = {
      input: userMessage
      // If HG Bot needs a different shape (e.g., {message, context} ) change here.
    };

    // Use global fetch if available, otherwise require node-fetch.
    let fetchFn = fetch;
    if (typeof fetchFn !== 'function') {
      fetchFn = (await import('node-fetch')).default;
    }

    const apiRes = await fetchFn(HG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HG_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const txt = await apiRes.text();
      console.error('HG API error', apiRes.status, txt);
      return res.status(502).json({ error: `HG Bot API error: ${apiRes.status} ${txt}` });
    }

    // Attempt to parse response; adapt to the real response shape
    const apiJson = await apiRes.json();

    // Heuristic: try common fields for reply text
    const reply = apiJson.reply || apiJson.output || apiJson.message || apiJson.data || apiJson.text || JSON.stringify(apiJson);

    res.json({ reply });
  } catch (err) {
    console.error('Server error calling HG Bot:', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
