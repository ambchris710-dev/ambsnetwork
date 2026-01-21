const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// always 200 (for browser + uptime robot)
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('OK'));

// ===== SEND WHATSAPP MESSAGE FUNCTION =====
async function sendWhatsAppMessage(to, text) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error('Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN');
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// ===== TEMP TEST ROUTE (send to yourself) =====
app.get('/send-test', async (req, res) => {
  try {
    const myNumber = process.env.TEST_TO; // your WhatsApp number
    if (!myNumber) {
      return res.status(400).send('TEST_TO env variable not set');
    }

    await sendWhatsAppMessage(
      myNumber,
      'Hello 👋 this message is from my WhatsApp Render app!'
    );

    res.send('Test message sent ✅');
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Failed to send ❌');
  }
});

// ===== WEBHOOK VERIFY (GET) =====
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ===== WEBHOOK RECEIVER (POST) =====
app.post('/webhook', (req, res) => {
  res.sendStatus(200);
  console.log(JSON.stringify(req.body, null, 2));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
