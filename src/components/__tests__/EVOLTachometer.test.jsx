import { describe, expect, it } from 'vitest';
import {
  calculateRpm,
  calculateVowelSum,
  clamp01,
  getTimeBoost,
} from '../EVOLTachometer.utils.mjs';

describe('EVOLTachometer utilities', () => {
  it('clamp01 keeps values in [0,1]', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.6)).toBe(0.6);
    expect(clamp01(5)).toBe(1);
  });

  it('applies phi boost only in the 10:08-10:12 window', () => {
    expect(getTimeBoost(new Date('2026-01-01T10:09:00'))).toBe(1.1618);
    expect(getTimeBoost(new Date('2026-01-01T10:12:00'))).toBe(1.1618);
    expect(getTimeBoost(new Date('2026-01-01T10:13:00'))).toBe(1);
  });

  it('computes weighted vowel sum', () => {
    const sum = calculateVowelSum({ A: 1, E: 1, I: 1, O: 1, U: 1, Y: 1 });
    expect(sum).toBeCloseTo(0.3);
  });

  it('calculates and clamps rpm', () => {
    const result = calculateRpm({
      x: 0,
      y: 1,
      z: 1,
      w: 1,
      vowels: { A: 1, E: 0, I: 0, O: 0, U: 0, Y: 0 },
      currentTime: new Date('2026-01-01T12:00:00'),
    });

    expect(result.vowelSum).toBeCloseTo(0.3);
    expect(result.gT).toBe(1);
    expect(result.rpm).toBe(1);
  });
});
