const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Stream = require('getstream');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// GetStream credentials from environment variables
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const appId = process.env.STREAM_APP_ID; // optional if you want to return App ID

// Initialize server client
const serverClient = Stream.connect(apiKey, apiSecret);

// Token generation endpoint
app.post('/get-token', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send({ error: 'userId required' });

  const token = serverClient.createUserToken(userId);
  res.send({ token, apiKey, appId });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
