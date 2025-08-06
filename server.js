const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { StreamVideoServer } = require('@stream-io/video-server');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// GetStream credentials
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const server = new StreamVideoServer(apiKey, apiSecret);

// Token generation endpoint
app.post('/get-token', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send({ error: 'userId required' });

  const token = server.createToken(userId);
  res.send({ token, apiKey });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
