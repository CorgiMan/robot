const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

const SIMULATION_INTERVAL = 10; // ms
const UPDATE_INTERVAL = 100; // ms

// todo(wieger): use library for units
// todo(wieger): don't assume deceleration is the same as acceleration
const liftAcc = 30; // mm/s^2
const swingAcc = 5; // deg/s^2
const elbowAcc = 5; // deg/s^2
const wristAcc = 5; // deg/s^2
const gripperAcc = 4; // mm/s^2

const liftMaxSpeed = 200; // mm/s
const swingMaxSpeed = 30; // deg/s
const elbowMaxSpeed = 30; // deg/s
const wristMaxSpeed = 30; // deg/s
const gripperMaxSpeed = 30; // mm/s

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

const state = {
  lift: 0,
  swing: 0,
  elbow: 0,
  wrist: 0,
  gripper: 0,
  
  liftSpeed: 0,
  swingSpeed: 0,
  elbowSpeed: 0,
  wristSpeed: 0,
  gripperSpeed: 0,

  liftTarget: 0,
  swingTarget: 0,
  elbowTarget: 0,
  wristTarget: 0,
  gripperTarget: 0,
};

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
      handleMessage(data);
      
      // Handle any client requests here if needed
      if (data.type === 'request_state') {
        ws.send(JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

setInterval(() => simulateState(), SIMULATION_INTERVAL);
setInterval(() => broadcastState(), UPDATE_INTERVAL);

function broadcastState() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

function simulateState() {
  const dt = SIMULATION_INTERVAL/1000;

  if(state.lift + 0.5 * (state.liftSpeed ** 2) / liftAcc > state.liftTarget) state.liftSpeed -= liftAcc * dt
  else state.liftSpeed += liftAcc * dt;

  // if(state.liftTarget < state.lift) state.liftSpeed -= liftAcc * dt;
  // if(state.liftTarget > state.lift) state.liftSpeed += liftAcc * dt;
  // if(state.swingTarget < state.swing) state.swingSpeed -= swingAcc * dt;
  // if(state.swingTarget > state.swing) state.swingSpeed += swingAcc * dt;
  // if(state.elbowTarget < state.elbow) state.elbowSpeed -= elbowAcc * dt;
  // if(state.elbowTarget > state.elbow) state.elbowSpeed += elbowAcc * dt;
  // if(state.wristTarget < state.wrist) state.wristSpeed -= wristAcc * dt;
  // if(state.wristTarget > state.wrist) state.wristSpeed += wristAcc * dt;
  // if(state.gripperTarget < state.gripper) state.gripperSpeed -= gripperAcc * dt;
  // if(state.gripperTarget > state.gripper) state.gripperSpeed -= gripperAcc * dt;

  state.liftSpeed = clamp(state.liftSpeed, -liftMaxSpeed, liftMaxSpeed);
  state.swingSpeed = clamp(state.swingSpeed, -swingMaxSpeed, swingMaxSpeed);
  state.elbowSpeed = clamp(state.elbowSpeed, -elbowMaxSpeed, elbowMaxSpeed);
  state.wristSpeed = clamp(state.wristSpeed, -wristMaxSpeed, wristMaxSpeed);
  state.gripperSpeed = clamp(state.gripperSpeed, -gripperMaxSpeed, gripperMaxSpeed);

  state.lift += state.liftSpeed * dt;
  state.swing += state.swingSpeed * dt;
  state.elbow += state.elbowSpeed * dt;
  state.wrist += state.wristSpeed * dt;
  state.gripper += state.gripperSpeed * dt;
}

function handleMessage(data) {
  // todo(wieger): input validation
  state.liftTarget = Number(data.liftTarget);
  state.swingTarget = Number(data.swingTarget);
  state.elbowTarget = Number(data.elbowTarget);
  state.wristTarget = Number(data.wristTarget);
  state.gripperTarget = Number(data.gripperTarget);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
