// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // NOTE: CORS only applies in dev when frontend is run separately (Live Server)
// In production (served from same container), no cross-origin needed

require('dotenv').config();

const app = express();

// Be explicit about allowed dev origins (localhost and 127.0.0.1 are different)
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin tools (like curl/Postman) with no Origin header
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

const PORT = process.env.PORT || 8000;

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage explicitly (helps if directory indexes are off or index.html missing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Health check (plain text)
app.get('/whoami', (req, res) => {
  res.json({ host: process.env.HOSTNAME || 'unknown' });
});

app.get('/healthz', (req, res) => res.status(200).type('text').send('ok'));
console.log('Serving static from:', path.join(__dirname, 'public'));
// API endpoint to fetch books
// Uses Google Books API with optional API key from .env


app.get('/api/books', async (req, res) => {
  const query = (req.query.q || '').trim();
  const apiKey = process.env.API_KEY;

  if (!query) {
    return res.status(400).json({ error: "Missing required query parameter 'q'." });
  }

  try {
    // Build params and include key only if present
    const params = { q: query };
    if (apiKey) params.key = apiKey;

    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      { params }
    );

    res.json(response.data);
  } catch (error) {
    // Log full error for server-side debugging
    console.error('Error fetching books:', error?.response?.data || error.message);

    // Return a helpful, CORS-enabled error payload
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to fetch books';

    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
