/**
 * BLEUCHAIN WebXR server
 * - Serves the public/ directory
 * - Provides a websocket at /ws to broadcast live events
 * - Accepts POST /api/block to simulate 'Add Block' events from other services
 *
 * Usage:
 *   cd server
 *   npm install
 *   npm start
 *
 * Then open http://localhost:3000/webxr.html
 */
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Simple health
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Broadcast helper
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

// POST endpoint to simulate new blocks
// expected body: { id: "ENFT-001", intensity: 0.2, meta: { ... } }
app.post('/api/block', (req, res) => {
  const body = req.body || {};
  const payload = {
    id: body.id || `blk-${Date.now()}`,
    time: Date.now(),
    intensity: typeof body.intensity === 'number' ? body.intensity : 0.12,
    meta: body.meta || {}
  };
  broadcast('blockAdded', payload);
  res.json({ ok: true, emitted: payload });
});

// Simple listing of ws clients
app.get('/api/clients', (req, res) => {
  res.json({ clients: wss.clients.size });
});

// Launch server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, () => {
  console.log(`BLEUCHAIN WebXR server running on http://localhost:${PORT} (public -> ${PUBLIC_DIR})`);
});
