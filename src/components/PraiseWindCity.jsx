import React, { useState, useEffect } from 'react';
import cityZones from '../../data/city_zones.json';

const PRAISE_TIMES = ['Dawn', 'Noon', 'Dusk', 'Midnight'];

const PILLAR_COLORS = {
  1: 'from-yellow-700 to-yellow-500',
  2: 'from-sky-700 to-sky-400',
  3: 'from-violet-700 to-violet-400',
  4: 'from-blue-700 to-blue-400',
  5: 'from-indigo-700 to-indigo-400',
  6: 'from-green-700 to-green-400',
  7: 'from-rose-700 to-pink-400',
};

const ZONE_COLORS = {
  InnerCore: 'bg-yellow-500',
  MiddleCore: 'bg-blue-500',
  OuterCore: 'bg-green-500',
  Crown: 'bg-purple-500',
};

const PraisePulseBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-semibold ${active ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
    🌬️ {active ? 'PRAISE WIND ACTIVE' : 'INACTIVE'}
  </span>
);

const StatusChip = ({ status }) => {
  const map = { blueprint: 'bg-yellow-600', active: 'bg-green-600', sealed: 'bg-purple-600' };
  return (
    <span className={`${map[status] || 'bg-gray-600'} text-white text-xs px-2 py-1 rounded uppercase font-bold`}>
      {status}
    </span>
  );
};

const SpiralZone = ({ name, zone }) => (
  <div className="flex items-center gap-3 py-2 border-b border-slate-600 last:border-0">
    <div className={`w-3 h-3 rounded-full ${ZONE_COLORS[name]}`} />
    <div className="flex-1">
      <div className="text-white font-semibold text-sm">{name}</div>
      <div className="text-gray-400 text-xs">{zone.name}</div>
    </div>
    <div className="text-right text-xs">
      <div className="text-gray-300">{zone.radius_ft} ft</div>
      <div className="text-yellow-400 capitalize">{zone.access}</div>
    </div>
  </div>
);

const DomeCard = ({ dome, onClick, selected }) => (
  <div
    className={`bg-slate-800 rounded-xl p-5 cursor-pointer transition border-2 ${selected ? 'border-blue-400 bg-slate-700' : 'border-transparent hover:border-blue-600'}`}
    onClick={() => onClick(dome.id)}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-lg font-bold text-white">{dome.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <StatusChip status={dome.status} />
          <PraisePulseBadge active={dome.praise_pulse_active} />
        </div>
      </div>
      <div className="text-right text-xs text-gray-400">
        <div>{dome.capacity.residents.toLocaleString()} residents</div>
        <div>{dome.capacity.cocoon_chambers} cocoons</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-300">
      <div className="bg-slate-700 rounded p-2">
        <div className="text-gray-400 mb-1">Praise Schedule</div>
        {Object.entries(dome.praise_schedule).map(([cycle, time]) => (
          <div key={cycle} className="flex justify-between">
            <span className="capitalize text-blue-300">{cycle}</span>
            <span className="text-white">{time}</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-700 rounded p-2">
        <div className="text-gray-400 mb-1">Dome Layer</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Material</span>
            <span className="text-white">{dome.dome_layers.material}</span>
          </div>
          <div className="flex justify-between">
            <span>Bleu Light</span>
            <span className={dome.dome_layers.bleu_light_walls ? 'text-green-400' : 'text-red-400'}>
              {dome.dome_layers.bleu_light_walls ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Rainbow Door</span>
            <span className={dome.dome_layers.rainbow_doorway ? 'text-green-400' : 'text-red-400'}>
              {dome.dome_layers.rainbow_doorway ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DomeDetail = ({ dome }) => (
  <div className="bg-slate-800 rounded-xl p-6 mt-4">
    <h2 className="text-2xl font-bold text-white mb-1">{dome.name}</h2>
    <p className="text-gray-400 text-sm mb-4">Zone ID: {dome.id} &mdash; {dome.coordinates.zone}</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Spiral Layout */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-yellow-400 font-bold mb-3">🌀 Fibonacci Spiral Zones</h3>
        {Object.entries(dome.spiral_layout).map(([name, zone]) => (
          <SpiralZone key={name} name={name} zone={zone} />
        ))}
      </div>

      {/* Systems */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-blue-400 font-bold mb-3">⚙️ Active Systems</h3>
        <div className="space-y-2">
          {dome.systems.map((sys) => (
            <div key={sys} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-white">{sys}</span>
            </div>
          ))}
        </div>

        <h3 className="text-purple-400 font-bold mt-4 mb-3">👥 Capacity</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(dome.capacity).map(([k, v]) => (
            <div key={k} className="bg-slate-600 rounded p-2">
              <div className="text-gray-400 text-xs capitalize">{k.replace('_', ' ')}</div>
              <div className="text-white font-bold">{v.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const GlobalSystemsPanel = ({ systems }) => (
  <div className="bg-slate-800 rounded-xl p-6">
    <h2 className="text-xl font-bold text-white mb-4">🌍 Global Systems</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(systems).map(([key, sys]) => (
        <div key={key} className="bg-slate-700 rounded-lg p-4">
          <div className="text-green-400 font-bold mb-1">{key.replace(/_/g, ' ')}</div>
          <div className="text-gray-300 text-sm mb-2">{sys.description}</div>
          {sys.requirements && (
            <div className="space-y-1">
              {sys.requirements.map((r) => (
                <div key={r} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-yellow-400">✓</span> {r.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
          {sys.effect && <div className="text-blue-300 text-xs mt-1">Effect: {sys.effect}</div>}
          {sys.authority && <div className="text-purple-300 text-xs mt-1">Authority: {sys.authority}</div>}
        </div>
      ))}
    </div>
  </div>
);

const PraiseWindCity = () => {
  const [selectedDome, setSelectedDome] = useState(null);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulseActive((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDomeClick = (id) => {
    setSelectedDome((prev) => (prev === id ? null : id));
  };

  const selectedDomeData = cityZones.regions.find((r) => r.id === selectedDome);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl">🦋</span>
                <h1 className="text-3xl font-bold text-white">Praise Wind City Blueprint</h1>
              </div>
              <p className="text-blue-100 text-sm">
                SEED2WING™ — Global Metamorphic City Architecture &nbsp;|&nbsp; Fibonacci Spiral Protocol
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">{cityZones.regions.length} Dome Zones</div>
              <div className="text-blue-200 text-sm">Bleu-light frequency walls active</div>
            </div>
          </div>

          {/* Praise Cycle Bar */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {PRAISE_TIMES.map((t) => (
              <div
                key={t}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pulseActive ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-200'}`}
              >
                🌬️ {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityZones.regions.map((dome) => (
            <DomeCard
              key={dome.id}
              dome={dome}
              onClick={handleDomeClick}
              selected={selectedDome === dome.id}
            />
          ))}
        </div>

        {/* Detail Panel */}
        {selectedDomeData && <DomeDetail dome={selectedDomeData} />}

        {/* Global Systems */}
        <GlobalSystemsPanel systems={cityZones.global_systems} />

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>🌈 Rainbow Doorway: ACTIVE</span>
            <span>🦋 ButterflyGuard: ARMED</span>
            <span>🌱 ES0IL Grid: SEEDED</span>
          </div>
          <div>Architecture: {cityZones.architecture}</div>
        </div>
      </div>
    </div>
  );
};

export default PraiseWindCity;
