const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const INTENTIONAL_FAILURE = process.env.INTENTIONAL_FAILURE === 'true';

// Simple in-memory counter for demo
let requestCount = 0;

app.get('/health', (req, res) => {
  if (INTENTIONAL_FAILURE) {
    return res.status(500).json({
      status: 'unhealthy',
      version: APP_VERSION,
      error: 'Intentional failure for rollback test',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    status: 'healthy',
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', (req, res) => {
  if (INTENTIONAL_FAILURE) {
    return res.status(503).json({
      app: 'simple-app',
      ready: false,
      version: APP_VERSION,
      error: 'Intentional failure for rollback test'
    });
  }

  res.status(200).json({
    app: 'simple-app',
    ready: true,
    version: APP_VERSION
  });
});

app.get('/', (req, res) => {
  requestCount++;
  res.json({
    app: 'simple-app',
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
