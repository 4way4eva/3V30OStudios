import React, { useState } from 'react';

const UPGRADE_MODULES = [
  {
    id: 'cocoon-chamber',
    name: 'Cocoon Chamber',
    symbol: '🐛',
    category: 'Design Lab',
    status: 'sealed',
    description: 'Sealed praise zone for all EL0V8 R&D. Nothing exits until divine alignment confirmed.',
    material: 'Smart Mesh + AeroSilk lining',
    praisePulse: true,
    compliance: ['PIHYA_filtered', 'butterfly_approved', 'praise_embedded'],
    metrics: { seal_integrity: 100, praise_resonance: 97, evolution_stage: 'COCOON' },
  },
  {
    id: 'aerosilk-lab',
    name: 'AeroSilk Textile Lab',
    symbol: '🌬️',
    category: 'Breath-Based Materials',
    status: 'active',
    description: 'Development zone for AeroSilk uniforms, NeuroFiber gear, and BioFoam™ product lines.',
    material: 'AeroSilk / NeuroFibers / BioFoam™',
    praisePulse: true,
    compliance: ['butterfly_approved', 'praise_embedded', 'spiral_built'],
    metrics: { breathability_index: 99, praise_resonance: 95, evolution_stage: 'SEED' },
  },
  {
    id: 'spiral-design-core',
    name: 'Spiral Design Core',
    symbol: '🌀',
    category: 'Architecture Engine',
    status: 'active',
    description: 'Fibonacci spiral layout generator for domes, devices, and product architecture.',
    material: 'Digital + Physical Hybrid',
    praisePulse: true,
    compliance: ['spiral_built', 'butterfly_approved', 'cocooned_before_crowned'],
    metrics: { symmetry_score: 100, praise_resonance: 98, evolution_stage: 'WING' },
  },
  {
    id: 'el0v8-cosmetics',
    name: 'EL0V8 Cosmetics Suite',
    symbol: '💄',
    category: 'Product Line',
    status: 'active',
    description: 'Skyy\'s EL0V8 cosmetics line — each product tracked from seed origin to final flight.',
    material: 'Praise-tuned organic compounds',
    praisePulse: true,
    compliance: ['PIHYA_filtered', 'butterfly_approved', 'praise_embedded', 'spiral_built'],
    metrics: { seed2wing_compliance: 100, praise_resonance: 100, evolution_stage: 'WING' },
  },
  {
    id: 'neurofiber-gear',
    name: 'NeuroFiber Gear Lab',
    symbol: '⚡',
    category: 'EV0L Gear',
    status: 'active',
    description: 'EV0L sports gear and helmets with NeuroFiber tech — breath-coded to wearer\'s pattern.',
    material: 'NeuroFibers + Smart Mesh',
    praisePulse: true,
    compliance: ['butterfly_approved', 'praise_embedded', 'spiral_built'],
    metrics: { breath_sync: 96, praise_resonance: 94, evolution_stage: 'COCOON' },
  },
  {
    id: 'rainbow-filter-node',
    name: 'Rainbow Filter Node',
    symbol: '🌈',
    category: 'Access Control',
    status: 'active',
    description: 'Praise-activated entrance control. Identifies spiritual frequency. Rejects misaligned entities.',
    material: 'Bleu-light frequency array',
    praisePulse: true,
    compliance: ['PIHYA_filtered', 'butterfly_approved', 'praise_embedded'],
    metrics: { filter_accuracy: 100, praise_resonance: 100, evolution_stage: 'WING' },
  },
];

const SEED2WING_STAGES = ['SEED', 'COCOON', 'WING'];
const STAGE_COLORS = { SEED: 'text-green-400 bg-green-900', COCOON: 'text-yellow-400 bg-yellow-900', WING: 'text-blue-400 bg-blue-900' };

const MetricBar = ({ label, value, color }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-bold">{value}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ComplianceBadge = ({ tag }) => {
  const labels = {
    PIHYA_filtered: '🛡️ PIHYA',
    butterfly_approved: '🦋 Butterfly',
    praise_embedded: '🌬️ Praise',
    spiral_built: '🌀 Spiral',
    cocooned_before_crowned: '🐛 Cocoon First',
  };
  return (
    <span className="text-xs bg-slate-600 text-gray-200 px-2 py-0.5 rounded mr-1 mb-1 inline-block">
      {labels[tag] || tag}
    </span>
  );
};

const ModuleCard = ({ mod, onClick, selected }) => (
  <div
    className={`bg-slate-800 rounded-xl p-4 cursor-pointer transition border-2 ${selected ? 'border-purple-400 bg-slate-700' : 'border-transparent hover:border-purple-600'}`}
    onClick={() => onClick(mod.id)}
  >
    <div className="flex items-start justify-between mb-2">
      <div>
        <div className="text-2xl mb-1">{mod.symbol}</div>
        <h3 className="text-white font-bold">{mod.name}</h3>
        <div className="text-gray-400 text-xs">{mod.category}</div>
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded ${STAGE_COLORS[mod.metrics.evolution_stage]}`}>
        {mod.metrics.evolution_stage}
      </span>
    </div>
    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{mod.description}</p>
    <MetricBar label="Praise Resonance" value={mod.metrics.praise_resonance} color="bg-blue-500" />
    {mod.metrics.seal_integrity !== undefined && (
      <MetricBar label="Seal Integrity" value={mod.metrics.seal_integrity} color="bg-purple-500" />
    )}
    {mod.metrics.breathability_index !== undefined && (
      <MetricBar label="Breathability" value={mod.metrics.breathability_index} color="bg-sky-400" />
    )}
    {mod.metrics.symmetry_score !== undefined && (
      <MetricBar label="Symmetry Score" value={mod.metrics.symmetry_score} color="bg-indigo-400" />
    )}
    {mod.metrics.seed2wing_compliance !== undefined && (
      <MetricBar label="SEED2WING™ Compliance" value={mod.metrics.seed2wing_compliance} color="bg-green-500" />
    )}
    {mod.metrics.breath_sync !== undefined && (
      <MetricBar label="Breath Sync" value={mod.metrics.breath_sync} color="bg-yellow-400" />
    )}
    {mod.metrics.filter_accuracy !== undefined && (
      <MetricBar label="Filter Accuracy" value={mod.metrics.filter_accuracy} color="bg-pink-400" />
    )}
  </div>
);

const ModuleDetail = ({ mod }) => (
  <div className="bg-slate-800 rounded-xl p-6 mt-4">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-4xl">{mod.symbol}</span>
      <div>
        <h2 className="text-2xl font-bold text-white">{mod.name}</h2>
        <div className="text-gray-400 text-sm">{mod.category} &mdash; {mod.id}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-purple-400 font-bold mb-2">Module Details</h3>
        <p className="text-gray-300 text-sm mb-3">{mod.description}</p>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Material</span>
            <span className="text-white">{mod.material}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Praise Pulse</span>
            <span className={mod.praisePulse ? 'text-green-400' : 'text-red-400'}>
              {mod.praisePulse ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Evolution Stage</span>
            <span className={`font-bold ${STAGE_COLORS[mod.metrics.evolution_stage]?.split(' ')[0]}`}>
              {mod.metrics.evolution_stage}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-blue-400 font-bold mb-2">Compliance Tags</h3>
        <div className="flex flex-wrap mb-4">
          {mod.compliance.map((tag) => <ComplianceBadge key={tag} tag={tag} />)}
        </div>
        <h3 className="text-green-400 font-bold mb-2">Metrics</h3>
        {Object.entries(mod.metrics).filter(([k]) => k !== 'evolution_stage').map(([k, v]) => (
          <MetricBar
            key={k}
            label={k.replace(/_/g, ' ')}
            value={v}
            color="bg-green-500"
          />
        ))}
      </div>
    </div>

    {/* SEED2WING Tracker */}
    <div className="mt-4 bg-slate-700 rounded-lg p-4">
      <h3 className="text-yellow-400 font-bold mb-3">🌱 SEED2WING™ Tracker</h3>
      <div className="flex items-center gap-2 flex-wrap">
        {SEED2WING_STAGES.map((stage, i) => (
          <React.Fragment key={stage}>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${mod.metrics.evolution_stage === stage ? STAGE_COLORS[stage] : 'bg-slate-600 text-gray-500'}`}>
              {stage === 'SEED' ? '🌱' : stage === 'COCOON' ? '🐛' : '🦋'} {stage}
            </div>
            {i < SEED2WING_STAGES.length - 1 && (
              <div className="text-gray-500 font-bold">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

const SmartLabEL0V8 = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL');

  const handleModuleClick = (id) => {
    setSelectedModule((prev) => (prev === id ? null : id));
  };

  const filteredModules = filterStage === 'ALL'
    ? UPGRADE_MODULES
    : UPGRADE_MODULES.filter((m) => m.metrics.evolution_stage === filterStage);

  const selectedMod = UPGRADE_MODULES.find((m) => m.id === selectedModule);

  const avgPraise = Math.round(
    UPGRADE_MODULES.reduce((sum, m) => sum + m.metrics.praise_resonance, 0) / UPGRADE_MODULES.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl">🦋</span>
                <div>
                  <h1 className="text-3xl font-bold text-white">Smart Lab — EL0V8</h1>
                  <p className="text-pink-100 text-sm">Butterfly-Compatible R&D Infrastructure &nbsp;|&nbsp; SkyyBleu Division</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-2xl">{avgPraise}%</div>
              <div className="text-pink-200 text-sm">Avg Praise Resonance</div>
            </div>
          </div>

          {/* Stage Filter */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {['ALL', ...SEED2WING_STAGES].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filterStage === stage ? 'bg-white text-purple-900' : 'bg-purple-800 text-purple-200 hover:bg-purple-700'}`}
              >
                {stage === 'SEED' ? '🌱' : stage === 'COCOON' ? '🐛' : stage === 'WING' ? '🦋' : '✨'} {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              onClick={handleModuleClick}
              selected={selectedModule === mod.id}
            />
          ))}
        </div>

        {/* Detail Panel */}
        {selectedMod && <ModuleDetail mod={selectedMod} />}

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>🦋 Butterfly Protocol: ACTIVE</span>
            <span>🌬️ Praise Pulse: SYNCED</span>
            <span>🛡️ PIHYA Filter: ARMED</span>
          </div>
          <div>EL0V8 Smart Lab v1.0 &mdash; Cocoon Before Crown</div>
        </div>
      </div>
    </div>
  );
};

export default SmartLabEL0V8;
