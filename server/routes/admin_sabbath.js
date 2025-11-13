// server/routes/admin_sabbath.js
// HMAC-protected admin API to toggle Sabbath state. Uses server/middleware/hmacAuth.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const hmacAuth = require('../middleware/hmacAuth');

const router = express.Router();
const stateFile = path.join(__dirname, '..', '..', 'data', 'sabbath_state.json');

function readState() {
  try {
    if (fs.existsSync(stateFile)) return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (e) {}
  return { mode: 'off', updated_at: new Date(0).toISOString(), updated_by: 'system', history: [] };
}

function writeState(state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
}

// POST /api/admin/sabbath { mode: 'on'|'off', actor?: 'name' }
router.post('/api/admin/sabbath', hmacAuth, (req, res) => {
  const mode = req.body && req.body.mode;
  const actor = req.body && req.body.actor ? req.body.actor : (req.header('x-actor') || 'admin');
  if (!mode || !['on', 'off'].includes(mode)) return res.status(400).json({ ok: false, error: 'invalid mode' });

  const now = new Date().toISOString();
  const current = readState();
  current.mode = mode;
  current.updated_at = now;
  current.updated_by = actor;
  current.history = current.history || [];
  current.history.push({ mode, updated_at: now, updated_by: actor });

  try {
    writeState(current);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'write failed' });
  }

  // Optionally notify WebXR server by invoking the notify script if present
  const notifier = path.join(__dirname, '..', '..', 'scripts', 'notify-on-mint.js');
  if (fs.existsSync(notifier) && process.env.WEBHOOK_SECRET && process.env.WEBXR_SERVER_URL) {
    const id = `SABBATH-${mode}-${Date.now()}`;
    const args = [notifier, '--url', `${process.env.WEBXR_SERVER_URL}/api/block`, '--secret', process.env.WEBHOOK_SECRET, '--id', id, '--intensity', '0.01', '--meta', JSON.stringify({ type: 'sabbath', mode, actor, timestamp: now })];
    try {
      spawnSync('node', args, { stdio: 'inherit' });
    } catch (e) {
      // noop
    }
  }

  return res.json({ ok: true, mode: current.mode, updated_at: current.updated_at });
});

module.exports = router;