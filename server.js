const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Stream = require('getstream');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = Stream.connect(apiKey, apiSecret);

app.post('/get-token', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send({ error: 'userId required' });

  const token = serverClient.createUserToken(userId);
  res.send({ token, apiKey });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// ---- WebSocket signaling ----
const wss = new WebSocketServer({ server });
let clients = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    const { type, target, sender } = data;

    if (type === 'register') {
      clients[sender] = ws;
    } else if (target && clients[target]) {
      clients[target].send(JSON.stringify(data));
    }
  });

  ws.on('close', () => {
    for (let id in clients) {
      if (clients[id] === ws) delete clients[id];
    }
  });
});
