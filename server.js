const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const UPDATE_INTERVAL = 1000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
}); 

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// State object with 4 values
let state = {
  a: 0,
  b: 0,
  c: 0,
  d: 0
};

// Function to generate random values for state
function updateState() {
  state.a = Math.floor(Math.random() * 100);
  state.b = Math.floor(Math.random() * 100);
  state.c = Math.floor(Math.random() * 100);
  state.d = Math.floor(Math.random() * 100);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Send initial state
  ws.send(JSON.stringify(state));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Handle any client requests here if needed
      if (data.type === 'request_state') {
        ws.send(JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast state to all connected clients
function broadcastState() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

setInterval(() => {
  updateState();
  broadcastState();
  console.log('Broadcasting state:', state);
}, UPDATE_INTERVAL);

