import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';

const VOWEL_CONFIG = [
  { key: 'A', weight: 0.3, label: '(+0.30)' },
  { key: 'E', weight: 0.0, label: '(0.00)' },
  { key: 'I', weight: 0.2, label: '(+0.20)' },
  { key: 'O', weight: -0.2, label: '(−0.20)' },
  { key: 'U', weight: -0.1, label: '(−0.10)' },
  { key: 'Y', weight: 0.1, label: '(+0.10)' },
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const getTimeBoost = (time) => {
  const minutes = time.getHours() * 60 + time.getMinutes();
  if (minutes >= 608 && minutes <= 612) {
    return 1.1618;
  }
  return 1;
};

const EVOLTachometer = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(1);
  const [z, setZ] = useState(0);
  const [w, setW] = useState(0.5);
  const [vowels, setVowels] = useState({ A: 0, E: 0, I: 0, O: 0, U: 0, Y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { rpm, gT, vowelSum } = useMemo(() => {
    const sum = VOWEL_CONFIG.reduce((total, v) => total + vowels[v.key] * v.weight, 0);
    const timeBoost = getTimeBoost(currentTime);

    const currentRpm = clamp01((y - x) * (1 + 0.5 * z) * (0.5 + 0.5 * w) * (1 + sum) * timeBoost);

    return { rpm: currentRpm, gT: timeBoost, vowelSum: sum };
  }, [currentTime, vowels, w, x, y, z]);

  const captureSnapshot = () => {
    const snapshot = {
      timestamp: currentTime.toISOString(),
      localTime: currentTime.toLocaleTimeString(),
      axes: { X: x, Y: y, Z: z, W: w },
      vowels: { ...vowels },
      rpm: rpm.toFixed(4),
      gT: gT.toFixed(4),
      vowelSum: vowelSum.toFixed(4),
      phiBoost: gT > 1,
    };

    setHistory((prev) => [snapshot, ...prev].slice(0, 20));
  };

  const downloadBlob = (payload, fileName, type) => {
    const blob = new Blob([payload], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      system: 'EVOL X/Y 忘→见 Tachometer',
      timestamp: new Date().toISOString(),
      currentState: {
        axes: { X: x, Y: y, Z: z, W: w },
        vowels,
        rpm: rpm.toFixed(4),
        gT: gT.toFixed(4),
      },
      history,
    };

    downloadBlob(JSON.stringify(data, null, 2), `evol-rpm-${Date.now()}.json`, 'application/json');
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'LocalTime', 'X', 'Y', 'Z', 'W', 'A', 'E', 'I', 'O', 'U', 'Yv', 'RPM', 'gT', 'PhiBoost'];
    const rows = history.map((item) => [
      item.timestamp,
      item.localTime,
      item.axes.X,
      item.axes.Y,
      item.axes.Z,
      item.axes.W,
      item.vowels.A,
      item.vowels.E,
      item.vowels.I,
      item.vowels.O,
      item.vowels.U,
      item.vowels.Y,
      item.rpm,
      item.gT,
      item.phiBoost,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadBlob(csv, `evol-rpm-${Date.now()}.csv`, 'text/csv');
  };

  const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isPhiWindow = minutes >= 608 && minutes <= 612;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-400">EVOL X/Y 继承转速表</h1>
          <p className="text-gray-400">忘→见 (Forget→See) Inheritance Tachometer</p>
          <div className={`text-2xl font-mono ${isPhiWindow ? 'text-yellow-400 animate-pulse' : 'text-gray-300'}`}>
            {currentTime.toLocaleTimeString()} {isPhiWindow && '⚡ φ-BOOST'}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-blue-400">{rpm.toFixed(4)}</div>
            <div className="text-sm text-gray-400">Current RPM (0.00 - 1.00)</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${rpm * 100}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              g(T) = <span className="text-yellow-400">{gT.toFixed(4)}</span>
            </div>
            <div>
              Σ Vowels = <span className="text-green-400">{vowelSum.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">轴 Axes (0-1)</h3>
            <div className="space-y-3">
              {[{ key: 'X', value: x, setter: setX, label: '封 (Seal)' }, { key: 'Y', value: y, setter: setY, label: '显 (Reveal)' }, { key: 'Z', value: z, setter: setZ, label: '深 (Depth)' }, { key: 'W', value: w, setter: setW, label: '意志 (Will)' }].map((axis) => (
                <div key={axis.key}>
                  <label className="text-sm text-gray-400">
                    {axis.key} = {axis.label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={axis.value}
                    onChange={(event) => axis.setter(parseFloat(event.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-xs text-gray-500">{axis.value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">气道 Vowels</h3>
            <div className="space-y-2">
              {VOWEL_CONFIG.map((vowel) => (
                <div key={vowel.key} className="flex items-center justify-between">
                  <label className="text-sm w-24">
                    {vowel.key} {vowel.label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={vowels[vowel.key]}
                    onChange={(event) =>
                      setVowels((prev) => ({ ...prev, [vowel.key]: parseFloat(event.target.value) }))
                    }
                    className="flex-1 mx-2"
                  />
                  <span className="text-xs text-gray-500 w-8">{vowels[vowel.key].toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={captureSnapshot} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
            📸 Capture Snapshot
          </button>
          <button
            onClick={exportJSON}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download size={20} /> Export JSON
          </button>
          <button
            onClick={exportCSV}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">历史 History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="bg-gray-900 p-3 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{item.localTime}</span>
                    <span className="text-blue-400 font-mono">RPM: {item.rpm}</span>
                    {item.phiBoost && <span className="text-yellow-400">⚡φ</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-sm">
          <h3 className="text-lg font-semibold mb-2 text-cyan-400">公式 Formula</h3>
          <code className="text-gray-300">rpm = clamp((Y−X) × (1+0.5Z) × (0.5+0.5W) × (1+ΣVowels) × g(T))</code>
          <div className="mt-3 text-gray-400 space-y-1">
            <div>• 10:10 = 610分 = F₁₅ (Fibonacci 15)</div>
            <div>• ±2分触发窗口: [608, 612] → g(T) = φ = 1.1618</div>
            <div>• 其他时段: g(T) = 1.0000</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVOLTachometer;
