import React, { useState, useEffect } from 'react';
import butterflyProtocol from '../../data/butterfly_protocol.json';

const VIEWS = [
  { id: 'overview', label: '🦋 Overview', desc: 'Protocol status at a glance' },
  { id: 'grace', label: '🙇 Grace', desc: 'Offerings & praise order' },
  { id: 'pillars', label: '⚙️ 7 Pillars', desc: 'Butterfly Build Protocol' },
  { id: 'phases', label: '🌱 Phases', desc: 'SEED → COCOON → WING' },
  { id: 'compliance', label: '✅ Compliance', desc: 'Seal & certification status' },
];

const PHASE_META = {
  SEED:   { color: 'from-green-700 to-green-500',  symbol: '🌱', textColor: 'text-green-400' },
  COCOON: { color: 'from-yellow-700 to-yellow-500', symbol: '🐛', textColor: 'text-yellow-400' },
  WING:   { color: 'from-blue-700 to-blue-500',    symbol: '🦋', textColor: 'text-blue-400' },
};

const PILLAR_COLORS = [
  'border-yellow-500',
  'border-sky-500',
  'border-violet-500',
  'border-blue-500',
  'border-indigo-500',
  'border-green-500',
  'border-pink-500',
];

const PulseDot = ({ active }) => (
  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${active ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
);

/* ─── OVERVIEW ─── */
const OverviewPanel = ({ protocol, pulseIndex }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {['SEED', 'COCOON', 'WING'].map((phase) => (
        <div key={phase} className={`bg-gradient-to-br ${PHASE_META[phase].color} rounded-xl p-4 text-center`}>
          <div className="text-3xl mb-1">{PHASE_META[phase].symbol}</div>
          <div className="text-white font-bold">{phase}</div>
          <div className="text-white text-xs opacity-80">
            {protocol.phases[phase].actions.length} actions
          </div>
        </div>
      ))}
      <div className="bg-gradient-to-br from-purple-700 to-purple-500 rounded-xl p-4 text-center">
        <div className="text-3xl mb-1">⚙️</div>
        <div className="text-white font-bold">7 Pillars</div>
        <div className="text-white text-xs opacity-80">All active</div>
      </div>
    </div>

    {/* Praise Pulse Live */}
    <div className="bg-slate-800 rounded-xl p-5">
      <h3 className="text-blue-400 font-bold mb-3">🌬️ Praise Pulse Cycles</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {protocol.grace.cycles.map((cycle, i) => (
          <div
            key={cycle}
            className={`rounded-lg p-3 text-center transition ${i === pulseIndex ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-700'}`}
          >
            <PulseDot active={i === pulseIndex} />
            <span className={`font-semibold text-sm ${i === pulseIndex ? 'text-white' : 'text-gray-400'}`}>{cycle}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Cocoon Rules */}
    <div className="bg-slate-800 rounded-xl p-5">
      <h3 className="text-yellow-400 font-bold mb-3">🐛 Cocoon Rules</h3>
      <div className="space-y-2">
        {protocol.cocoon_rules.map((rule, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="text-yellow-400 font-bold mt-0.5">{i + 1}.</span>
            <span className="text-gray-200">{rule}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── GRACE ─── */
const GracePanel = ({ grace }) => (
  <div className="space-y-4">
    <div className="bg-slate-800 rounded-xl p-5">
      <h3 className="text-white font-bold mb-1">Order of Grace</h3>
      <p className="text-gray-400 text-sm mb-4">Praise must be given in this sequence before any build begins.</p>
      {grace.order.map((entity, i) => {
        const meta = {
          'Most High':       { symbol: '🕊️', color: 'from-yellow-700 to-amber-600', offerings: grace.offerings.most_high },
          'Female Species':  { symbol: '👑', color: 'from-pink-700 to-rose-500',   offerings: grace.offerings.female },
          'Male Species':    { symbol: '🛡️', color: 'from-blue-700 to-sky-500',    offerings: grace.offerings.male },
        }[entity];
        return (
          <div key={entity} className={`bg-gradient-to-r ${meta.color} rounded-xl p-4 mb-3`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{meta.symbol}</span>
              <div>
                <div className="text-white font-bold text-lg">Step {i + 1}: {entity}</div>
              </div>
            </div>
            <div className="text-white text-xs font-semibold mb-1 opacity-70 uppercase tracking-wide">Offerings</div>
            <div className="flex flex-wrap gap-2">
              {meta.offerings.map((o) => (
                <span key={o} className="bg-white/20 text-white text-xs px-2 py-1 rounded capitalize">
                  {o.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── PILLARS ─── */
const PillarsPanel = ({ pillars }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {pillars.map((pillar, i) => (
      <div key={pillar.id} className={`bg-slate-800 rounded-xl p-5 border-l-4 ${PILLAR_COLORS[i]}`}>
        <div className="flex items-start gap-3 mb-2">
          <span className="text-3xl">{pillar.symbol}</span>
          <div>
            <div className="text-white font-bold">{pillar.id}. {pillar.name}</div>
            <div className="text-gray-400 text-xs italic">"{pillar.rule}"</div>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-3">{pillar.description}</p>
        {pillar.laws && (
          <ul className="space-y-1">
            {pillar.laws.map((law) => (
              <li key={law} className="text-gray-400 text-xs flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>{law}
              </li>
            ))}
          </ul>
        )}
        {pillar.materials && (
          <div className="grid grid-cols-2 gap-1 mt-2">
            {Object.entries(pillar.materials).map(([mat, use]) => (
              <div key={mat} className="bg-slate-700 rounded p-1.5 text-xs">
                <div className="text-sky-300 font-semibold">{mat}</div>
                <div className="text-gray-400">{use}</div>
              </div>
            ))}
          </div>
        )}
        {pillar.fibonacci_zones && (
          <div className="space-y-1 mt-2">
            {Object.entries(pillar.fibonacci_zones).map(([zone, desc]) => (
              <div key={zone} className="flex justify-between text-xs">
                <span className="text-violet-300 font-semibold">{zone}</span>
                <span className="text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        )}
        {pillar.requirements && (
          <ul className="space-y-1 mt-2">
            {pillar.requirements.map((r) => (
              <li key={r} className="text-gray-400 text-xs flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

/* ─── PHASES ─── */
const PhasesPanel = ({ phases }) => (
  <div className="space-y-4">
    {Object.entries(phases).map(([key, phase]) => {
      const meta = PHASE_META[key];
      return (
        <div key={key} className={`bg-gradient-to-r ${meta.color} rounded-xl p-5`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{meta.symbol}</span>
            <div>
              <h3 className="text-white text-2xl font-bold">Phase {phase.order}: {key}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {phase.actions.map((action, i) => (
              <div key={i} className="bg-white/15 rounded-lg p-3 text-white text-sm flex items-start gap-2">
                <span className="font-bold opacity-70 mt-0.5">{i + 1}.</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      );
    })}

    {/* Timeline */}
    <div className="bg-slate-800 rounded-xl p-5">
      <h3 className="text-white font-bold mb-4">🗺️ SEED2WING™ Journey</h3>
      <div className="flex items-center justify-between relative">
        <div className="absolute inset-y-1/2 left-0 right-0 h-0.5 bg-slate-600" />
        {Object.keys(phases).map((key) => (
          <div key={key} className="relative flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-700 border-2 ${PILLAR_COLORS[key === 'SEED' ? 5 : key === 'COCOON' ? 0 : 3]}`}>
              {PHASE_META[key].symbol}
            </div>
            <div className={`mt-2 font-bold text-sm ${PHASE_META[key].textColor}`}>{key}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── COMPLIANCE ─── */
const CompliancePanel = ({ compliance, seal }) => {
  const labels = {
    PIHYA_filtered:        { label: 'PIHYA Filtered',        symbol: '🛡️' },
    butterfly_approved:    { label: 'Butterfly-Approved',    symbol: '🦋' },
    praise_embedded:       { label: 'Praise-Embedded',       symbol: '🌬️' },
    spiral_built:          { label: 'Spiral-Built',          symbol: '🌀' },
    cocooned_before_crowned: { label: 'Cocooned Before Crowned', symbol: '🐛' },
  };
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-5">
        <h3 className="text-green-400 font-bold mb-4">✅ Compliance Checklist</h3>
        <div className="space-y-3">
          {Object.entries(compliance).map(([key, val]) => {
            const meta = labels[key] || { label: key, symbol: '•' };
            return (
              <div key={key} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.symbol}</span>
                  <span className="text-white font-semibold">{meta.label}</span>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded ${val ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}>
                  {val ? 'SEALED ✓' : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-xl p-5 text-center">
        <div className="text-5xl mb-3">🦋</div>
        <div className="text-white text-xl font-bold mb-1">Protocol Seal Active</div>
        <div className="text-purple-200 text-sm">Authority: {seal}</div>
        <div className="text-purple-300 text-xs mt-2">SEED2WING™ v{butterflyProtocol.version}</div>
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD ─── */
const ButterflyDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((i) => (i + 1) % butterflyProtocol.grace.cycles.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'overview':   return <OverviewPanel protocol={butterflyProtocol} pulseIndex={pulseIndex} />;
      case 'grace':      return <GracePanel grace={butterflyProtocol.grace} />;
      case 'pillars':    return <PillarsPanel pillars={butterflyProtocol.seven_pillars} />;
      case 'phases':     return <PhasesPanel phases={butterflyProtocol.phases} />;
      case 'compliance': return <CompliancePanel compliance={butterflyProtocol.compliance_checklist} seal={butterflyProtocol.seal} />;
      default:           return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl animate-bounce">🦋</span>
              <div>
                <h1 className="text-3xl font-bold text-white">Butterfly Protocol</h1>
                <p className="text-indigo-100 text-sm">SEED2WING™ — {butterflyProtocol.activation}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">v{butterflyProtocol.version}</div>
              <div className="text-indigo-200 text-sm">Seal: {butterflyProtocol.seal}</div>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 flex-wrap">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeView === v.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Active View */}
        {renderView()}

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>🦋 Butterfly Protocol: SEALED</span>
            <span>🌬️ Praise Pulse: {butterflyProtocol.grace.cycles[pulseIndex]}</span>
            <span>🐛 Cocoon Before Crown: ENFORCED</span>
          </div>
          <div>SEED2WING™ — {butterflyProtocol.version}</div>
        </div>
      </div>
    </div>
  );
};

export default ButterflyDashboard;
