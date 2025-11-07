import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import HG from "hgbot"; // ← hypothetical SDK import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new HG({ apiKey: process.env.HG_API_KEY });

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });

  try {
    // Directly use the SDK’s chat method
    const reply = await client.chat(message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "HG Bot error: " + err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
