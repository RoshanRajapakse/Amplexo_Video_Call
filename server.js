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
const apiKey = '7zcag4zcpv26';
const apiSecret = 'j3fp48hxwwgmfpuppghye92avgmbqyg4hwwddhpaezg8p4ryh76s8fckbd8wuvgm';

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
