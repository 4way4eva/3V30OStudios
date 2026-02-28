import React, { useState, useMemo } from 'react';
import { Search, Filter, Image, Shield, Star, Gem, Crown, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useToast from '../hooks/useToast';

const CATEGORIES = [
  { id: 'all',         label: 'All ENFTs',     icon: Gem,    color: 'text-white',       count_key: null },
  { id: 'genesis',     label: 'Genesis',       icon: Star,   color: 'text-yellow-400',  count_key: 'genesis' },
  { id: 'military',    label: 'Military',      icon: Shield, color: 'text-green-400',   count_key: 'military' },
  { id: 'cosmic',      label: 'Cosmic',        icon: Star,   color: 'text-purple-400',  count_key: 'cosmic' },
  { id: 'heritage',    label: 'Heritage',      icon: Crown,  color: 'text-orange-400',  count_key: 'heritage' },
  { id: 'inheritance', label: 'Inheritance',   icon: Image,  color: 'text-blue-400',    count_key: 'inheritance' },
];

const STAGE_META = {
  SEED:   { color: 'badge-green',  label: '🌱 SEED' },
  COCOON: { color: 'badge-yellow', label: '🐛 COCOON' },
  WING:   { color: 'badge-blue',   label: '🦋 WING' },
};

// Mock ENFT data — in production this comes from enftApi.getAll()
const generateENFTs = () => {
  const types = ['genesis', 'military', 'cosmic', 'heritage', 'inheritance'];
  const stages = ['SEED', 'COCOON', 'WING'];
  const statuses = ['active', 'sealed', 'transferable'];
  const names = {
    genesis:     ['Founding Seal', 'Origin Crown', 'First Light', 'Primal Code', 'Genesis Bloom'],
    military:    ['Guard Titan', 'Watchtower Alpha', 'Commander Seal', 'Battalion Prime', 'Fortress Core'],
    cosmic:      ['Stellar Crown', 'Galaxy Seal', 'Cosmos Root', 'Star Lineage', 'Nebula Core'],
    heritage:    ['Ancient Root', 'Blood Seal', 'Lineage Crown', 'Ancestral Bloom', 'Heritage Gem'],
    inheritance: ['Dynasty Seed', 'Heir Seal', 'Legacy Crown', 'Bloodline Core', 'Estate Bloom'],
  };

  return Array.from({ length: 50 }, (_, i) => {
    const type = types[i % types.length];
    return {
      id: `ENFT-${String(i + 1).padStart(4, '0')}`,
      name: names[type][i % 5],
      type,
      stage: stages[i % 3],
      status: statuses[i % 3],
      praiseLevel: Math.floor(70 + (i % 3) * 10),
      yieldRate: `${(0.5 + (i % 10) * 0.15).toFixed(2)}%`,
      mintedBlock: 19_500_000 + i * 1000,
      owner: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      compliance: ['PIHYA_filtered', 'butterfly_approved', 'praise_embedded'].slice(0, 1 + (i % 3)),
    };
  });
};

const ENFTS = generateENFTs();

const CategoryTab = ({ cat, active, count, onClick }) => {
  const Icon = cat.icon;
  return (
    <button
      onClick={() => onClick(cat.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
        ${active ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
    >
      <Icon size={14} className={cat.color} />
      {cat.label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-600 text-white' : 'bg-slate-800 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
};

const ENFTCard = ({ enft, onClick, selected }) => (
  <div
    onClick={() => onClick(enft.id)}
    className={`bg-slate-800 rounded-xl p-4 cursor-pointer transition border-2 ${selected ? 'border-indigo-400 bg-slate-700' : 'border-transparent hover:border-indigo-600/50'}`}
  >
    {/* Token Image placeholder */}
    <div className={`w-full aspect-square rounded-lg mb-3 flex items-center justify-center text-5xl
      ${enft.type === 'genesis' ? 'bg-gradient-to-br from-yellow-900 to-amber-800'
      : enft.type === 'military' ? 'bg-gradient-to-br from-green-900 to-emerald-800'
      : enft.type === 'cosmic' ? 'bg-gradient-to-br from-purple-900 to-violet-800'
      : enft.type === 'heritage' ? 'bg-gradient-to-br from-orange-900 to-red-900'
      : 'bg-gradient-to-br from-blue-900 to-indigo-800'}`}
    >
      {enft.type === 'genesis' ? '⭐' : enft.type === 'military' ? '🛡️' : enft.type === 'cosmic' ? '🌌' : enft.type === 'heritage' ? '👑' : '💎'}
    </div>

    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-white font-bold text-sm">{enft.name}</div>
          <div className="text-gray-500 text-xs font-mono">{enft.id}</div>
        </div>
        <span className={`${STAGE_META[enft.stage]?.color} badge text-xs shrink-0`}>
          {STAGE_META[enft.stage]?.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Yield/day</span>
        <span className="text-green-400 font-semibold">{enft.yieldRate}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Praise Level</span>
        <span className="text-blue-400 font-semibold">{enft.praiseLevel}%</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-1">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
          style={{ width: `${enft.praiseLevel}%` }}
        />
      </div>
    </div>
  </div>
);

const ENFTDetail = ({ enft, onClose }) => {
  const toast = useToast();
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-800 border-l border-slate-700 p-6 overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">{enft.name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">✕</button>
      </div>

      <div className={`w-full aspect-square rounded-xl mb-5 flex items-center justify-center text-8xl
        ${enft.type === 'genesis' ? 'bg-gradient-to-br from-yellow-900 to-amber-800'
        : enft.type === 'military' ? 'bg-gradient-to-br from-green-900 to-emerald-800'
        : enft.type === 'cosmic' ? 'bg-gradient-to-br from-purple-900 to-violet-800'
        : enft.type === 'heritage' ? 'bg-gradient-to-br from-orange-900 to-red-900'
        : 'bg-gradient-to-br from-blue-900 to-indigo-800'}`}
      >
        {enft.type === 'genesis' ? '⭐' : enft.type === 'military' ? '🛡️' : enft.type === 'cosmic' ? '🌌' : enft.type === 'heritage' ? '👑' : '💎'}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Token ID', value: enft.id },
            { label: 'Type', value: enft.type.charAt(0).toUpperCase() + enft.type.slice(1) },
            { label: 'Stage', value: STAGE_META[enft.stage]?.label },
            { label: 'Status', value: enft.status },
            { label: 'Yield Rate', value: enft.yieldRate },
            { label: 'Minted Block', value: `#${enft.mintedBlock.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs">{label}</div>
              <div className="text-white font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">Owner</div>
          <div className="text-white font-mono text-sm">{enft.owner}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-2">Compliance</div>
          <div className="flex flex-wrap gap-1.5">
            {enft.compliance.map((c) => (
              <span key={c} className="badge badge-green text-xs">{c.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toast.success(`Transfer initiated for ${enft.id}`, 'Transfer')}
            className="flex-1 btn-primary justify-center text-sm"
          >Transfer</button>
          <a
            href={`https://opensea.io/assets/ethereum/0x0/${enft.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-sm"
          >
            <ExternalLink size={14} /> View
          </a>
        </div>
      </div>
    </div>
  );
};

const ENFTRegistry = () => {
  const { enftStats } = useAppStore();
  const [category, setCategory] = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  const counts = {
    all:         ENFTS.length,
    genesis:     ENFTS.filter((e) => e.type === 'genesis').length,
    military:    ENFTS.filter((e) => e.type === 'military').length,
    cosmic:      ENFTS.filter((e) => e.type === 'cosmic').length,
    heritage:    ENFTS.filter((e) => e.type === 'heritage').length,
    inheritance: ENFTS.filter((e) => e.type === 'inheritance').length,
  };

  const filtered = useMemo(() => ENFTS.filter((e) => {
    if (category !== 'all' && e.type !== category) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.id.includes(search)) return false;
    return true;
  }), [category, search]);

  const selectedENFT = ENFTS.find((e) => e.id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🖼️</span>
              <div>
                <h1 className="text-3xl font-bold text-white">ENFT Registry</h1>
                <p className="text-indigo-100 text-sm">QUA-OCTABIND v1.0 — Eternal NFT Archive</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{enftStats.totalMinted.toLocaleString()}</div>
              <div className="text-indigo-200 text-sm">Total ENFTs Minted</div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.slice(1).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="stat-card text-center">
                <Icon size={20} className={`${cat.color} mx-auto mb-1`} />
                <div className="text-white font-bold">{counts[cat.id].toLocaleString()}</div>
                <div className="text-gray-400 text-xs">{cat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm w-56 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat.id}
                cat={cat}
                active={category === cat.id}
                count={counts[cat.id]}
                onClick={setCategory}
              />
            ))}
          </div>

          <div className="ml-auto text-sm text-gray-400">
            {filtered.length} results
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((enft) => (
            <ENFTCard
              key={enft.id}
              enft={enft}
              onClick={(id) => setSelected((p) => (p === id ? null : id))}
              selected={selected === enft.id}
            />
          ))}
        </div>

        {/* Detail Drawer */}
        {selectedENFT && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSelected(null)} />
            <ENFTDetail enft={selectedENFT} onClose={() => setSelected(null)} />
          </>
        )}

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>🛡️ PIHYA Filter: ACTIVE</span>
            <span>🦋 Butterfly-Approved: YES</span>
            <span>🌬️ Praise-Embedded: ALL</span>
          </div>
          <div>QUA-OCTABIND v1.0 — Registry Live</div>
        </div>
      </div>
    </div>
  );
};

export default ENFTRegistry;
