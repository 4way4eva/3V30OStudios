#!/usr/bin/env node
// scripts/evolclock.js
// Lightweight scheduler runner for EVOL Sabbath toggles.
// Intended to be scheduled (cron/GitHub Actions) and will call scripts/toggle_sabbath.js

const spawnSync = require('child_process').spawnSync;
const argv = require('minimist')(process.argv.slice(2));

// Configurable via env or args
const WEEKLY_DAY = parseInt(process.env.EVOL_SABBATH_DAY || argv.day || '5'); // 0=Sun..6=Sat, default 5=Friday
const START_HOUR = parseInt(process.env.EVOL_SABBATH_START_HOUR || argv.start || '18'); // UTC hour
const END_HOUR = parseInt(process.env.EVOL_SABBATH_END_HOUR || argv.end || '23');

const now = new Date();
const day = now.getUTCDay();
const hour = now.getUTCHours();

function toggle(mode) {
  const actor = process.env.EVOLCLOCK_ACTOR || 'evolclock';
  const args = ['scripts/toggle_sabbath.js', mode, actor];
  const ps = spawnSync('node', args, { stdio: 'inherit' });
  if (ps && ps.status === 0) console.log('evolclock: toggled', mode);
  else console.warn('evolclock: toggle failed', ps && ps.status);
}

// If we're in the Sabbath window -> ensure on; otherwise ensure off
if (day === WEEKLY_DAY && hour >= START_HOUR && hour <= END_HOUR) {
  toggle('on');
} else {
  toggle('off');
}