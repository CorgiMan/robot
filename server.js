const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT ?? 3000;

const SIMULATION_INTERVAL = 10; // ms
const UPDATE_INTERVAL = 100; // ms

const HALT = 0;
const LEFT = -1;
const RIGHT = 1;

// todo(wieger): use library for units
// todo(wieger): don't assume deceleration is the same as acceleration
// todo(wieger): make actuator object to make less repetitive
const liftAcc = 300 / 3; // mm/s^2
const liftDecl = 300 / 3; // mm/s^2
const swingAcc = 50 / 3; // deg/s^2
const swingDecl = 50 / 3; // deg/s^2
const elbowAcc = 50 / 3; // deg/s^2
const elbowDecl = 50 / 3; // deg/s^2
const wristAcc = 50 / 3; // deg/s^2
const wristDecl = 50 / 3; // deg/s^2
const gripperAcc = 40 / 3; // mm/s^2
const gripperDecl = 40 / 3; // mm/s^2

const liftMaxSpeed = 200; // mm/s
const swingMaxSpeed = 30; // deg/s
const elbowMaxSpeed = 30; // deg/s
const wristMaxSpeed = 30; // deg/s
const gripperMaxSpeed = 30; // mm/s

// todo(wieger): get these values from a shared config file
const liftW = 200;    
const arm1L = 660;
const arm1W = 180;
const arm2L = 600;
const arm2W = 150;
const gripperL = 360;
const gripperW = 90;
const r1 = liftW/2 + arm1L - arm1W/2;
const r2 = arm2L - arm2W;
const r3 = gripperL-gripperW/2 - 5;

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
  sendUpdate(ws, {updateTargets: true});
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      handleMessage(data);
      broadcastState({updateTargets: true});
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

function broadcastState({updateTargets = false} = {}) {
  state.height = state.lift;
  const a1 = state.swing * Math.PI/180;
  const a2 = a1 + state.elbow * Math.PI/180;
  const a3 = a2 + state.wrist * Math.PI/180;
  state.x = r1 * Math.cos(a1) + r2 * Math.cos(a2) + r3 * Math.cos(a3);
  state.z = r1 * Math.sin(a1) + r2 * Math.sin(a2) + r3 * Math.sin(a3);
  state.angle = a3 * 180/Math.PI;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendUpdate(client, {updateTargets});
    }
  });
}

// todo(wieger): this could be done in a more elegant way
function sendUpdate(client, {updateTargets = false} = {}) {
  if(updateTargets) state.targetsUpdated = true;
  client.send(JSON.stringify(state));
  if(updateTargets) state.targetsUpdated = false;
}

// todo(wieger): input validation
function handleMessage(data) {
  
  if(data.type === 'direct') {
    state.liftTarget = Number(data.liftTarget);
    state.swingTarget = Number(data.swingTarget);
    state.elbowTarget = Number(data.elbowTarget);
    state.wristTarget = Number(data.wristTarget);
    state.gripperTarget = Number(data.gripperTarget);
  }

  if(data.type === 'kinematic-inversion') {
    console.log('kinematic inversion');
    const gripperX = Number(data.x);
    const gripperZ = Number(data.z);
    const height = Number(data.height);
    
    const totalRads = Number(data.angle) * Math.PI/180;
    const wristX = gripperX - r3 * Math.cos(totalRads);
    const wristZ = gripperZ - r3 * Math.sin(totalRads);

    // using law of cosines
    // todo(wieger): add drawing of this calculation to documentation
    const r = Math.sqrt(wristX**2 + wristZ**2);
    const a = Math.atan2(wristZ, wristX);
    let arg = (r1*r1 + r*r - r2*r2)/(2*r1*r)
    if(arg > 1 && arg < 1.0001) arg = 1;
    if(arg < -1 && arg > -1.0001) arg = -1;
    const swingRads = a - Math.acos(arg) || 0;

    const elbowX = r1 * Math.cos(swingRads);
    const elbowZ = r1 * Math.sin(swingRads);
    const elbowRads = Math.atan2(wristZ - elbowZ, wristX - elbowX) - swingRads;

    // check if requested coordinates are reachable
    const ex = Math.cos(swingRads) * r1;
    const ez = Math.sin(swingRads) * r1;
    const wx = ex + r2 * Math.cos(swingRads + elbowRads);
    const wz = ez + r2 * Math.sin(swingRads + elbowRads);
    const gx = wx + r3 * Math.cos(totalRads);
    const gz = wz + r3 * Math.sin(totalRads);
    if((gx-gripperX)**2 + (gz-gripperZ)**2 < 1) {
      state.liftTarget = height;
      state.swingTarget = swingRads * 180/Math.PI;
      state.elbowTarget = elbowRads * 180/Math.PI;
      state.wristTarget = data.angle - state.swingTarget - state.elbowTarget;
    } else {
      // todo(wieger): notify user
      console.log('kinematic inversion failed');
      return;
    }
    
  }
}



function simulateState() {
  const dt = SIMULATION_INTERVAL/1000;

  {
  const {direction, decelerate} = accelerationDirection(state.lift, state.liftSpeed, liftDecl, state.liftTarget);
  if(decelerate) state.liftSpeed -= liftDecl * direction * dt;
  else state.liftSpeed += liftAcc * direction * dt;
  if(direction === HALT) state.liftSpeed = 0;
  }
  {
  const {direction, decelerate} = accelerationDirection(state.swing, state.swingSpeed, swingDecl, state.swingTarget);
  if(decelerate) state.swingSpeed -= swingDecl * direction * dt;
  else state.swingSpeed += swingAcc * direction * dt;
  if(direction === HALT) state.swingSpeed = 0;
  }
  {
  const {direction, decelerate} = accelerationDirection(state.elbow, state.elbowSpeed, elbowDecl, state.elbowTarget);
  if(decelerate) state.elbowSpeed -= elbowDecl * direction * dt;
  else state.elbowSpeed += elbowAcc * direction * dt;
  if(direction === HALT) state.elbowSpeed = 0;
  }
  {
  const {direction, decelerate} = accelerationDirection(state.wrist, state.wristSpeed, wristDecl, state.wristTarget);
  if(decelerate) state.wristSpeed -= wristDecl * direction * dt;
  else state.wristSpeed += wristAcc * direction * dt;
  if(direction === HALT) state.wristSpeed = 0;
  }
  {
  const {direction, decelerate} = accelerationDirection(state.gripper, state.gripperSpeed, gripperDecl, state.gripperTarget);
  if(decelerate) state.gripperSpeed -= gripperDecl * direction * dt;
  else state.gripperSpeed += gripperAcc * direction * dt;
  if(direction === HALT) state.gripperSpeed = 0;
  }

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function fullDecelerationDistance(speed, acc) {
  return Math.sign(speed) * 0.5 * (speed ** 2) / acc;
}

function accelerationDirection(value, speed, decl, target) {
  let direction = HALT;
  let decelerate = false;
  
  // prevent jittering
  if(Math.abs(speed) < 0.0001 && Math.abs(value - target) < 0.005) return {direction, decelerate};
  
  const maxDeclPosition = value + fullDecelerationDistance(speed, decl);
  if(value < target) {
    direction = RIGHT;
    if(maxDeclPosition >= target) decelerate = true;
  }
  if(target < value) {
    direction = LEFT;
    if(maxDeclPosition <= target) decelerate = true;
  }
  return {direction, decelerate};
}
