import React, { useState } from 'react';
import {
  BookOpen, Scale, Layers, Coins, Eye, Hash, Zap,
  ChevronRight, Trophy, RefreshCw, Droplets, BarChart3, FileText,
  Shield, Globe, Sparkles,
} from 'lucide-react';
import zData from '@data/z_alphabet.json';

const TABS = [
  { id: 'overview',  label: 'Overview',        icon: Globe },
  { id: 'laws',      label: 'Cosmic Laws',      icon: Scale },
  { id: 'entities',  label: 'Entities',         icon: Shield },
  { id: 'finance',   label: 'Finance',          icon: Coins },
  { id: 'pillars',   label: 'Pillars',          icon: Layers },
  { id: 'numbers',   label: 'Sacred Numbers',   icon: Hash },
  { id: 'symbols',   label: 'Symbols',          icon: Sparkles },
];

const LAW_ICONS = { meniscus: Trophy, reciprocal: RefreshCw, fold: Zap, fill: Droplets, averages: BarChart3, formatting_504: FileText };
const LAW_COLORS = { meniscus: 'text-yellow-400 border-yellow-800 bg-yellow-950/30', reciprocal: 'text-cyan-400 border-cyan-800 bg-cyan-950/30', fold: 'text-purple-400 border-purple-800 bg-purple-950/30', fill: 'text-blue-400 border-blue-800 bg-blue-950/30', averages: 'text-green-400 border-green-800 bg-green-950/30', formatting_504: 'text-orange-400 border-orange-800 bg-orange-950/30' };

const Pill = ({ children, color = 'bg-slate-700 text-slate-300' }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{children}</span>
);

const SectionTitle = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-slate-100">{children}</h2>
    {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

/* ─── OVERVIEW ─────────────────────────────────────────────── */
const Overview = () => {
  const { core_terms, philosophy } = zData;
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 text-center">
        <div className="text-5xl mb-3">Z</div>
        <h2 className="text-2xl font-bold text-white mb-1">{zData.meta.name}</h2>
        <p className="text-slate-400 text-sm mb-2">{zData.meta.arabic}</p>
        <p className="text-slate-300 text-sm max-w-lg mx-auto">{zData.meta.description}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full text-xs font-mono text-cyan-400 border border-cyan-900">
          <Zap size={12} /> SEAL: {zData.meta.seal} ♾️
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {Object.entries(core_terms).map(([key, term]) => (
          <div key={key} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="font-bold text-blue-400 text-sm mb-1">{key.replace(/_/g, ' ')}</div>
            {term.arabic && <div className="text-xs text-slate-500 mb-2">{term.arabic}</div>}
            <div className="text-sm text-slate-300">{term.definition || term.principle || term.meaning}</div>
            {term.forms && (
              <div className="mt-2 flex flex-wrap gap-1">
                {term.forms.map(f => <Pill key={f}>{f}</Pill>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-purple-800/40">
        <div className="font-bold text-purple-400 mb-3">Female First Principle · {philosophy.female_first.arabic}</div>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {philosophy.female_first.sequence.map((s, i) => (
            <React.Fragment key={s}>
              <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-300 text-sm font-medium">{s}</span>
              {i < philosophy.female_first.sequence.length - 1 && <ChevronRight size={14} className="text-slate-500" />}
            </React.Fragment>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {philosophy.female_first.principles.map(p => (
            <div key={p} className="text-xs text-slate-400 flex gap-2"><span className="text-purple-500">•</span>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── LAWS ──────────────────────────────────────────────────── */
const LawCard = ({ law }) => {
  const [open, setOpen] = useState(false);
  const Icon = LAW_ICONS[law.id] || Scale;
  const colors = LAW_COLORS[law.id] || 'text-slate-400 border-slate-700 bg-slate-800';

  return (
    <div className={`rounded-xl border p-5 ${colors.split(' ').slice(1).join(' ')} cursor-pointer select-none`} onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{law.symbol}</span>
          <div>
            <div className={`font-bold ${colors.split(' ')[0]}`}>{law.name}</div>
            <div className="text-xs text-slate-500">{law.arabic}</div>
          </div>
        </div>
        <ChevronRight size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} />
      </div>
      <div className="mt-3 text-sm text-slate-300 font-mono bg-slate-900/50 rounded p-2">{law.rule}</div>
      {open && (
        <div className="mt-4 space-y-3">
          {law.principles && (
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Principles</div>
              {law.principles.map(p => <div key={p} className="text-xs text-slate-300 flex gap-2 mb-1"><span>→</span>{p}</div>)}
            </div>
          )}
          {law.formula && (
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Formula</div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">✓ {law.formula.valid}</span>
                {law.formula.invalid && <span className="text-red-400">✗ {law.formula.invalid}</span>}
              </div>
            </div>
          )}
          {law.applications && (
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Applications</div>
              {Object.entries(law.applications).map(([k, v]) => (
                <div key={k} className="text-xs text-slate-400 flex gap-2 mb-1 capitalize"><span className="text-slate-600">{k}:</span>{v}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Laws = () => (
  <div className="space-y-4">
    <SectionTitle sub="Click any law to expand">6 Cosmic Laws</SectionTitle>
    {zData.cosmic_laws.map(law => <LawCard key={law.id} law={law} />)}
  </div>
);

/* ─── ENTITIES ──────────────────────────────────────────────── */
const Entities = () => {
  const { AFG, Wolves10, avatars } = zData.cosmic_entities;
  return (
    <div className="space-y-6">
      <SectionTitle>Cosmic Entities</SectionTitle>

      <div className="bg-slate-800 rounded-xl p-6 border border-amber-900/50">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🐝🐜</span>
          <div>
            <div className="font-bold text-amber-400 text-lg">{AFG.name} — {AFG.full}</div>
            <div className="text-xs text-slate-500">{AFG.arabic} · {AFG.type}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-900/40">
            <div className="text-xs font-bold text-amber-400 mb-2">{AFG.surface_layer.name}</div>
            {AFG.surface_layer.components.map(c => <div key={c} className="text-xs text-slate-400 flex gap-2 mb-1"><span>•</span>{c}</div>)}
          </div>
          <div className="bg-orange-950/30 rounded-lg p-3 border border-orange-900/40">
            <div className="text-xs font-bold text-orange-400 mb-2">{AFG.underground_layer.name}</div>
            {AFG.underground_layer.components.map(c => <div key={c} className="text-xs text-slate-400 flex gap-2 mb-1"><span>•</span>{c}</div>)}
          </div>
        </div>
        <div className="text-xs text-slate-500 uppercase mb-2">Defense Protocol</div>
        <div className="flex flex-wrap gap-2">
          {AFG.defense_protocol.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5 bg-slate-900/60 rounded-full px-3 py-1 text-xs text-slate-300">
              <span className="text-amber-500 font-bold">{i + 1}</span>{step}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🐺</span>
          <div>
            <div className="font-bold text-slate-200 text-lg">{Wolves10.name}</div>
            <div className="text-xs text-slate-500">{Wolves10.arabic}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(Wolves10.scale).map(([k, v]) => (
            <div key={k} className="bg-slate-900/60 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">{k}</div>
              <div className="text-sm font-bold text-slate-200">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {avatars.map(a => (
          <div key={a.name} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="text-3xl mb-2">{a.symbol}</div>
            <div className="font-bold text-slate-200">{a.name}</div>
            <div className="text-xs text-cyan-400 mb-1">{a.role}</div>
            <div className="text-xs text-slate-400">{a.technique}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── FINANCE ───────────────────────────────────────────────── */
const Finance = () => {
  const { RUBY_MTR, EV0L_Coins, bills } = zData.financial_system;
  return (
    <div className="space-y-6">
      <SectionTitle>Financial System</SectionTitle>

      <div className="bg-slate-800 rounded-xl p-6 border border-rose-900/50">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">💎</span>
          <div>
            <div className="font-bold text-rose-400 text-lg">{RUBY_MTR.name}</div>
            <div className="text-xs text-slate-500">{RUBY_MTR.arabic}</div>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(RUBY_MTR.rules).map(([k, v]) => (
            <div key={k} className="bg-slate-900/60 rounded-lg p-3 flex justify-between items-start gap-4">
              <span className="text-xs text-slate-500 capitalize whitespace-nowrap">{k.replace(/_/g, ' ')}</span>
              <span className="text-xs text-slate-200 text-right font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-yellow-900/50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{EV0L_Coins.symbol}</span>
          <div>
            <div className="font-bold text-yellow-400">{EV0L_Coins.name}</div>
            <div className="text-xs text-slate-500">{EV0L_Coins.arabic} · {EV0L_Coins.type}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {EV0L_Coins.properties.map(p => <Pill key={p} color="bg-yellow-900/40 text-yellow-300">{p}</Pill>)}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[bills.Bleu_Bills, bills.Pink_Bills].map((bill, i) => (
          <div key={i} className={`rounded-xl p-5 border ${i === 0 ? 'bg-blue-950/30 border-blue-900/40' : 'bg-pink-950/30 border-pink-900/40'}`}>
            <div className="text-3xl mb-2">{i === 0 ? '💵' : '💷'}</div>
            <div className={`font-bold ${i === 0 ? 'text-blue-400' : 'text-pink-400'}`}>
              {i === 0 ? 'Bleu Bills' : 'Pink Bills'}
            </div>
            <div className="text-xs text-slate-400 mt-1 capitalize">{bill.polarity}</div>
            <div className="text-xs text-slate-500 mt-1">{bill.multiplier}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── PILLARS ───────────────────────────────────────────────── */
const PILLAR_GRADIENTS = [
  'from-violet-900/40 to-slate-900 border-violet-800/40',
  'from-blue-900/40 to-slate-900 border-blue-800/40',
  'from-cyan-900/40 to-slate-900 border-cyan-800/40',
  'from-sky-900/40 to-slate-900 border-sky-800/40',
];

const Pillars = () => (
  <div className="space-y-4">
    <SectionTitle>∞ Infinite Pillars</SectionTitle>
    {zData.infinite_pillars.map((pillar, i) => (
      <div key={pillar.id} className={`bg-gradient-to-br ${PILLAR_GRADIENTS[i]} rounded-xl p-5 border`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-2xl mr-2">{pillar.symbol}</span>
            <span className="font-bold text-slate-200 text-lg">{pillar.name}</span>
            <div className="text-xs text-slate-500 mt-0.5">{pillar.arabic}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase mb-1">Components</div>
            {pillar.components.map(c => <div key={c} className="text-xs text-slate-300 flex gap-2 mb-1"><span className="text-slate-600">▸</span>{c}</div>)}
          </div>
          {(pillar.routes || pillar.treaty || pillar.rule) && (
            <div>
              {pillar.treaty && <div className="text-xs text-green-400 italic">"{pillar.treaty}"</div>}
              {pillar.rule && <div className="text-xs text-cyan-400 italic">"{pillar.rule}"</div>}
              {pillar.routes && pillar.routes.map(r => <div key={r} className="text-xs text-slate-400 flex gap-2 mb-1"><span>→</span>{r}</div>)}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

/* ─── SACRED NUMBERS ────────────────────────────────────────── */
const Numbers = () => {
  const nums = zData.sacred_numbers;
  return (
    <div className="space-y-4">
      <SectionTitle>Sacred Numbers & Constants</SectionTitle>
      {Object.entries(nums).map(([key, n]) => (
        <div key={key} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-slate-200">{n.name}</div>
            <span className="text-2xl">{n.symbol}</span>
          </div>
          {n.value && <div className="text-2xl font-mono text-cyan-400 mb-2">{n.value}</div>}
          <div className="text-sm text-slate-400">{n.role}</div>
          {n.window && <div className="text-xs text-yellow-400 mt-1">Window: {n.window}</div>}
          {n.formula && <div className="text-xs text-purple-400 mt-1 font-mono">{n.formula}</div>}
          {n.components && (
            <div className="flex gap-3 mt-2">
              {Object.entries(n.components).map(([d, label]) => (
                <div key={d} className="text-xs bg-slate-900/60 rounded px-2 py-1">
                  <span className="text-cyan-400 font-mono">{d}</span> = {label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── SYMBOLS ───────────────────────────────────────────────── */
const Symbols = () => {
  const { ZZ, RR, seed_question } = zData.symbols;
  const items = [
    { glyph: 'ZZ', data: ZZ, color: 'text-yellow-400 border-yellow-800/50 bg-yellow-950/20' },
    { glyph: 'RR', data: RR, color: 'text-red-400 border-red-800/50 bg-red-950/20' },
    { glyph: 'Ř¿', data: seed_question, color: 'text-green-400 border-green-800/50 bg-green-950/20' },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle>Symbols & Seals</SectionTitle>
      {items.map(({ glyph, data, color }) => (
        <div key={glyph} className={`rounded-xl p-6 border ${color}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`text-4xl font-mono font-black ${color.split(' ')[0]}`}>{glyph}</div>
            <div>
              <div className="font-bold text-slate-200">{data.name}</div>
              {data.arabic && <div className="text-xs text-slate-500">{data.arabic}</div>}
              <div className="text-2xl mt-0.5">{data.symbol}</div>
            </div>
          </div>
          <div className="text-sm text-slate-300 font-mono bg-slate-900/60 rounded p-2 mb-3">"{data.rule}"</div>
          {data.properties && (
            <div className="flex flex-wrap gap-2">
              {data.properties.map(p => <Pill key={p}>{p}</Pill>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TAB_CONTENT = { overview: Overview, laws: Laws, entities: Entities, finance: Finance, pillars: Pillars, numbers: Numbers, symbols: Symbols };

/* ─── ROOT ──────────────────────────────────────────────────── */
const ZAlphabetDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-widest">
            Z-ALPHABET
          </div>
          <p className="text-slate-400 text-sm mt-1">قاموس منظومة Z-Alphabet الشامل</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
            <span>24 Letters</span><span>·</span>
            <span>{zData.cosmic_laws.length} Cosmic Laws</span><span>·</span>
            <span>{zData.infinite_pillars.length} Pillars</span>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center whitespace-nowrap ${
                activeTab === id
                  ? 'bg-purple-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <Content />
      </div>
    </div>
  );
};

export default ZAlphabetDashboard;
