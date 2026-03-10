export const VOWEL_CONFIG = [
  { key: 'A', weight: 0.3, label: '(+0.30)' },
  { key: 'E', weight: 0.0, label: '(0.00)' },
  { key: 'I', weight: 0.2, label: '(+0.20)' },
  { key: 'O', weight: -0.2, label: '(−0.20)' },
  { key: 'U', weight: -0.1, label: '(−0.10)' },
  { key: 'Y', weight: 0.1, label: '(+0.10)' },
];

export const clamp01 = (value) => Math.max(0, Math.min(1, value));

export const getTimeBoost = (time) => {
  const minutes = time.getHours() * 60 + time.getMinutes();
  return minutes >= 608 && minutes <= 612 ? 1.1618 : 1;
};

export const calculateVowelSum = (vowels) =>
  VOWEL_CONFIG.reduce((total, vowel) => total + vowels[vowel.key] * vowel.weight, 0);

export const calculateRpm = ({ x, y, z, w, vowels, currentTime }) => {
  const vowelSum = calculateVowelSum(vowels);
  const gT = getTimeBoost(currentTime);
  const rpm = clamp01((y - x) * (1 + 0.5 * z) * (0.5 + 0.5 * w) * (1 + vowelSum) * gT);

  return { rpm, gT, vowelSum };
};
