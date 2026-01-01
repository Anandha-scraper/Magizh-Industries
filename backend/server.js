const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Minimal health check - this MUST work
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Magizh Industries API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Minimal health check - this MUST work
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Magizh Industries API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// PORT configuration for Cloud Run
const PORT = parseInt(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

console.log('='.repeat(50));
console.log('STARTING SERVER - MINIMAL MODE');
console.log('='.repeat(50));
console.log(`PORT: ${PORT}`);
console.log(`HOST: ${HOST}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log('='.repeat(50));

// Start server immediately - no async, no delays
app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('SERVER STARTED SUCCESSFULLY');
  console.log(`Listening on http://${HOST}:${PORT}`);
  console.log('='.repeat(50));
});

module.exports = app;
