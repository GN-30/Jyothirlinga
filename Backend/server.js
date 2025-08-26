console.log("Server script is starting...");
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; // The port your backend will run on

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable the server to read JSON from requests

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
  res.send('<h1>Backend server is running and reachable!</h1>');
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body; // Get the user's message from the frontend

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  const prompt = `You are an expert guide on the 12 Jyotirlingas of Lord Shiva... User query: "${message}"`; // Your full prompt
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    res.json(data); // Send the Gemini API's response back to the frontend
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to fetch from Gemini API.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});