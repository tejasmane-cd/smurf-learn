const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

// Simple in-memory counter for demo
let requestCount = 0;

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ ready: true });
});

app.get('/', (req, res) => {
  requestCount++;
  res.json({
    message: 'Hello from simple app!',
    version: APP_VERSION,
    requestCount: requestCount,
    uptime: process.uptime()
  });
});

app.get('/version', (req, res) => {
  res.json({ version: APP_VERSION });
});

// Simulate failure endpoint for testing rollback
app.get('/fail', (req, res) => {
  res.status(500).json({ error: 'App intentionally failed' });
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`App v${APP_VERSION} listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
