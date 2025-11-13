#!/usr/bin/env node
/**
 * toggle_sabbath.js
 * - Usage: node scripts/toggle_sabbath.js on [actor]
 * - Writes data/sabbath_state.json and (optionally) notifies the WebXR server via existing notify-on-mint.js
 *
 * Optional environment variables:
 * - WEBXR_SERVER_URL (if you want the notify helper to run with defaults)
 * - WEBHOOK_SECRET (if not already set globally)
 *
 * This script intentionally keeps network calls optional; it is safe to run offline.
 */
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawnSync;

const argv = process.argv.slice(2);
if (argv.length < 1 || !['on','off'].includes(argv[0])) {
  console.error('Usage: node scripts/toggle_sabbath.js on|off [actor]');
  process.exit(2);
}

const mode = argv[0];
const actor = argv[1] || process.env.USER || 'unknown';
const now = new Date().toISOString();
const stateFile = path.join(__dirname, '..', 'data', 'sabbath_state.json');

let state = {
  mode: mode,
  updated_at: now,
  updated_by: actor,
  history: [{ mode, updated_at: now, updated_by: actor }]
};

if (fs.existsSync(stateFile)) {
  try {
    const cur = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    cur.history = cur.history || [];
    cur.history.push({ mode, updated_at: now, updated_by: actor });
    cur.mode = mode;
    cur.updated_at = now;
    cur.updated_by = actor;
    state = cur;
  } catch (e) {
    // fall back to fresh state
  }
}

fs.mkdirSync(path.dirname(stateFile), { recursive: true });
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
console.log('Sabbath state written:', stateFile, 'mode=', mode);

// Optionally notify WebXR via notify-on-mint.js (if present)
const notifier = path.join(__dirname, 'notify-on-mint.js');
const webxrUrl = process.env.WEBXR_SERVER_URL || '';
const secret = process.env.WEBHOOK_SECRET || '';

if (fs.existsSync(notifier) && (webxrUrl || process.env.WEBXR_SERVER_URL)) {
  console.log('Attempting optional notify to WebXR server...');
  const id = `SABBATH-${mode}-${Date.now()}`;
  // call the notify helper; it will HMAC-sign the payload
  const args = [
    notifier,
    '--url', `${webxrUrl || process.env.WEBXR_SERVER_URL}/api/block`,
    '--secret', secret || process.env.WEBHOOK_SECRET || '',
    '--id', id,
    '--intensity', '0.01',
    '--meta', JSON.stringify({ type: 'sabbath', mode, actor, timestamp: now })
  ];
  // Node child_process spawnSync using 'node' binary
  const ps = spawn('node', args, { stdio: 'inherit' });
  if (ps && ps.status === 0) {
    console.log('WebXR notified (if reachable).');
  } else {
    console.warn('Notify helper exited with status:', ps && ps.status);
  }
} else {
  console.log('Notify helper not executed (missing notify-on-mint.js or WEBXR_SERVER_URL).');
}

process.exit(0);
