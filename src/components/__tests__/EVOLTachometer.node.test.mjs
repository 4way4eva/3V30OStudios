import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRpm,
  calculateVowelSum,
  clamp01,
  getTimeBoost,
} from '../EVOLTachometer.utils.mjs';

test('clamp01 keeps values in [0,1]', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(0.6), 0.6);
  assert.equal(clamp01(5), 1);
});

test('applies phi boost only in the 10:08-10:12 window', () => {
  assert.equal(getTimeBoost(new Date('2026-01-01T10:09:00')), 1.1618);
  assert.equal(getTimeBoost(new Date('2026-01-01T10:12:00')), 1.1618);
  assert.equal(getTimeBoost(new Date('2026-01-01T10:13:00')), 1);
});

test('computes weighted vowel sum', () => {
  const sum = calculateVowelSum({ A: 1, E: 1, I: 1, O: 1, U: 1, Y: 1 });
  assert.ok(Math.abs(sum - 0.3) < 1e-9);
});

test('calculates and clamps rpm', () => {
  const result = calculateRpm({
    x: 0,
    y: 1,
    z: 1,
    w: 1,
    vowels: { A: 1, E: 0, I: 0, O: 0, U: 0, Y: 0 },
    currentTime: new Date('2026-01-01T12:00:00'),
  });

  assert.ok(Math.abs(result.vowelSum - 0.3) < 1e-9);
  assert.equal(result.gT, 1);
  assert.equal(result.rpm, 1);
});
