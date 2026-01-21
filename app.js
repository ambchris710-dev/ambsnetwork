// app.js

const express = require('express');

const app = express();
app.use(express.json());

// Render uses PORT env var
const port = process.env.PORT || 3000;

// For webhook verification (set this in Render Environment Variables)
const verifyToken = process.env.VERIFY_TOKEN;

// 1) Health check for UptimeRobot / Render (always 200)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Optional: make homepage also return 200 (helps monitoring)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 2) Webhook verification endpoint (use a separate path)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 3) Webhook receiver (POST)
app.post('/webhook', (req, res) => {
  // respond fast first
  res.sendStatus(200);

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
