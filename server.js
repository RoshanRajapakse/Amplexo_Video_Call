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

// In-memory storage (in production, use a real database)
let guests = [];
let appointments = [];
let doctors = [
  { id: 'dr-smith', name: 'Dr. Sarah Smith', specialty: 'General Medicine', available: true },
  { id: 'dr-johnson', name: 'Dr. Michael Johnson', specialty: 'Cardiology', available: true },
  { id: 'dr-williams', name: 'Dr. Emily Williams', specialty: 'Pediatrics', available: true },
  { id: 'dr-brown', name: 'Dr. David Brown', specialty: 'Dermatology', available: true }
];

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API Routes for Guest Management
app.post('/api/guests', (req, res) => {
  const guest = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  guests.push(guest);
  res.json(guest);
});

app.get('/api/guests', (req, res) => {
  res.json(guests);
});

app.put('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const index = guests.findIndex(g => g.id === id);
  if (index !== -1) {
    guests[index] = { ...guests[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(guests[index]);
  } else {
    res.status(404).json({ error: 'Guest not found' });
  }
});

app.delete('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const index = guests.findIndex(g => g.id === id);
  if (index !== -1) {
    guests.splice(index, 1);
    res.json({ message: 'Guest deleted successfully' });
  } else {
    res.status(404).json({ error: 'Guest not found' });
  }
});

// API Routes for Appointment Management
app.post('/api/appointments', (req, res) => {
  const appointment = {
    id: generateId(),
    ...req.body,
    status: 'scheduled',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.push(appointment);
  res.json(appointment);
});

app.get('/api/appointments', (req, res) => {
  const { date, status } = req.query;
  let filteredAppointments = appointments;
  
  if (date) {
    filteredAppointments = filteredAppointments.filter(apt => 
      apt.appointmentDate.startsWith(date)
    );
  }
  
  if (status) {
    filteredAppointments = filteredAppointments.filter(apt => 
      apt.status === status
    );
  }
  
  res.json(filteredAppointments);
});

app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(appointments[index]);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments.splice(index, 1);
    res.json({ message: 'Appointment cancelled successfully' });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// API Routes for Doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// Dashboard Statistics
app.get('/api/dashboard/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => 
    apt.appointmentDate.startsWith(today)
  );
  
  const stats = {
    totalGuests: guests.length,
    totalAppointments: appointments.length,
    todayAppointments: todayAppointments.length,
    pendingPayments: appointments.filter(apt => apt.paymentStatus === 'pending').length,
    completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length
  };
  
  res.json(stats);
});

// Get Stream token for video calls
app.post('/get-token', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send({ error: 'userId required' });

  const token = serverClient.createUserToken(userId);
  res.send({ token, apiKey });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// ---- WebSocket signaling for video calls ----
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
