import React, { useState } from 'react';
import { Vault, TrendingUp, Coins, Shield, RefreshCw, ChevronRight, BarChart3, Lock, Zap } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useToast from '../hooks/useToast';

const VAULTS = [
  {
    id: 'tripleStack',
    name: 'Triple Stack Treasury',
    symbol: '🔱',
    description: 'Three-layer compounding vault. Yield compounds across Prime, Sub-Prime, and Quantum stacks.',
    color: 'from-blue-700 to-cyan-600',
    borderColor: 'border-blue-500/40',
    glowColor: 'shadow-blue-500/20',
    layers: ['Prime Stack — base yield 2.1%/day', 'Sub-Prime Stack — amplified 1.8%/day', 'Quantum Stack — cosmic 0.9%/day'],
    networks: ['Ethereum', 'Polygon', 'Avalanche'],
    contractKey: 'TripleStackTreasuryLedger',
  },
  {
    id: 'fourStack',
    name: 'Four-Stack Treasury',
    symbol: '⚡',
    description: 'Four-dimensional compounding vault with Sphere A through D, aligned to cosmic cycles.',
    color: 'from-purple-700 to-pink-600',
    borderColor: 'border-purple-500/40',
    glowColor: 'shadow-purple-500/20',
    layers: ['Sphere A — earth tier', 'Sphere B — water tier', 'Sphere C — fire tier', 'Sphere D — cosmic tier'],
    networks: ['Ethereum', 'BSC', 'Avalanche'],
    contractKey: 'FourStackTreasuryLedger',
  },
  {
    id: 'enftVault',
    name: 'ENFT Sovereign Vault',
    symbol: '🖼️',
    description: 'Locked yield from the ENFT system. Each Eternal NFT generates perpetual divine yield.',
    color: 'from-indigo-700 to-violet-600',
    borderColor: 'border-indigo-500/40',
    glowColor: 'shadow-indigo-500/20',
    layers: ['Genesis ENFT — founders tier', 'Military ENFT — guards tier', 'Cosmic ENFT — sovereign tier'],
    networks: ['Ethereum', 'Polygon'],
    contractKey: 'ENFTLedger',
  },
  {
    id: 'inheritance',
    name: 'Inheritance Vault',
    symbol: '👑',
    description: 'Generational wealth vault. Yields pass through bloodline sequences in perpetuity.',
    color: 'from-yellow-700 to-orange-600',
    borderColor: 'border-yellow-500/40',
    glowColor: 'shadow-yellow-500/20',
    layers: ['First-Gen lineage', 'Second-Gen compounding', 'Ancestral perpetuity'],
    networks: ['Ethereum', 'Avalanche'],
    contractKey: 'MegazionInheritanceLedger',
  },
];

const YIELD_HISTORY = [28, 31, 27, 35, 38, 33, 40, 44, 42, 48, 51, 53];
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm opacity-80 hover:opacity-100 transition"
          style={{ height: `${(v / max) * 100}%` }}
          title={`${MONTHS[i]}: ${v}T`}
        />
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="stat-card flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <div className="text-white font-bold text-lg leading-none">{value}</div>
      <div className="text-gray-400 text-xs">{label}</div>
      {sub && <div className="text-green-400 text-xs font-semibold">{sub}</div>}
    </div>
  </div>
);

const VaultCard = ({ vault, stats, onClick, selected }) => (
  <div
    onClick={() => onClick(vault.id)}
    className={`rounded-xl p-5 border cursor-pointer transition-all duration-200 ${vault.borderColor}
      ${selected ? `bg-slate-700 shadow-xl ${vault.glowColor}` : 'bg-slate-800 hover:bg-slate-750'}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{vault.symbol}</span>
        <div>
          <h3 className="text-white font-bold">{vault.name}</h3>
          <div className="text-gray-400 text-xs">{vault.contractKey}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-green-400 font-bold">{stats?.health ?? 100}%</div>
        <div className="text-gray-500 text-xs">Health</div>
      </div>
    </div>

    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{vault.description}</p>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-slate-700/60 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Balance</div>
        <div className="text-white font-bold">${stats?.balance}</div>
      </div>
      <div className="bg-slate-700/60 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Daily Yield</div>
        <div className="text-green-400 font-bold">+${stats?.dailyYield}</div>
      </div>
    </div>

    <div className="flex items-center justify-between text-xs">
      <div className="flex gap-1.5 flex-wrap">
        {vault.networks.map((n) => (
          <span key={n} className="bg-slate-700 text-gray-300 px-2 py-0.5 rounded">{n}</span>
        ))}
      </div>
      <ChevronRight size={14} className={`text-gray-500 transition ${selected ? 'rotate-90' : ''}`} />
    </div>
  </div>
);

const VaultDetail = ({ vault, stats }) => {
  const toast = useToast();
  const handleClaim = () => toast.success(`Yield claim submitted for ${vault.name}`, 'Claim Initiated');
  const handleDiagnostic = () => toast.info(`Running diagnostics on ${vault.name}...`, 'Diagnostic');

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/40 mt-4">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl">{vault.symbol}</span>
        <div>
          <h2 className="text-2xl font-bold text-white">{vault.name}</h2>
          <div className="text-gray-400 text-sm">{vault.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2 space-y-4">
          {/* Stack Layers */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Vault size={16} className="text-blue-400" /> Stack Layers
            </h3>
            <div className="space-y-2">
              {vault.layers.map((layer, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-gray-300">{layer}</span>
                  <div className="ml-auto flex items-center gap-1 text-green-400 text-xs">
                    <Lock size={10} /> ACTIVE
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yield History Chart */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-green-400" /> 12-Month Yield History (T)
            </h3>
            <MiniBarChart data={YIELD_HISTORY} />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              {MONTHS.filter((_, i) => i % 3 === 0).map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-gray-400 text-xs">Total Balance</div>
              <div className="text-white font-bold text-xl">${stats?.balance}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Daily Yield</div>
              <div className="text-green-400 font-bold text-lg">+${stats?.dailyYield}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Total Yield Claimed</div>
              <div className="text-blue-300 font-bold">${stats?.totalYield}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Vault Health</div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${stats?.health ?? 100}%` }}
                />
              </div>
              <div className="text-green-400 text-xs mt-1 font-semibold">{stats?.health ?? 100}%</div>
            </div>
          </div>

          <button onClick={handleClaim}
            className="w-full btn-primary justify-center bg-gradient-to-r from-green-600 to-emerald-600">
            <Coins size={15} /> Claim Yield
          </button>
          <button onClick={handleDiagnostic}
            className="w-full btn-secondary justify-center">
            <RefreshCw size={15} /> Run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

const MEGAZIONVaultDashboard = () => {
  const { vaultStats } = useAppStore();
  const [selectedVault, setSelectedVault] = useState(null);

  const totalBalance = Object.values(vaultStats)
    .reduce((sum, v) => sum + parseFloat(v.balance.replace('T', '')), 0);
  const totalDailyYield = Object.values(vaultStats)
    .reduce((sum, v) => sum + parseFloat(v.dailyYield.replace('T', '')), 0);

  const handleVaultClick = (id) => setSelectedVault((p) => (p === id ? null : id));
  const selectedData = VAULTS.find((v) => v.id === selectedVault);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏦</span>
              <div>
                <h1 className="text-3xl font-bold text-white">MEGAZION Vault System</h1>
                <p className="text-green-100 text-sm">TripleStack · FourStack · ENFT Vault · Inheritance — All Active</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${totalBalance.toFixed(1)}T</div>
              <div className="text-green-200 text-sm">Total Locked Value</div>
            </div>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Locked Value"   value={`$${totalBalance.toFixed(1)}T`} sub="+2.1% today"    icon={Vault}    color="bg-green-700" />
          <MetricCard label="Daily Yield"          value={`$${totalDailyYield.toFixed(2)}T`} sub="per 24h"    icon={TrendingUp} color="bg-blue-700" />
          <MetricCard label="Active Vaults"        value="4/4"               sub="All Operational"           icon={Shield}   color="bg-purple-700" />
          <MetricCard label="Networks"             value="5 chains"          sub="Ethereum + 4 more"         icon={Zap}      color="bg-orange-700" />
        </div>

        {/* Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VAULTS.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              stats={vaultStats[vault.id]}
              onClick={handleVaultClick}
              selected={selectedVault === vault.id}
            />
          ))}
        </div>

        {/* Vault Detail */}
        {selectedData && (
          <VaultDetail vault={selectedData} stats={vaultStats[selectedData.id]} />
        )}

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between text-sm text-gray-400 gap-2">
          <div className="flex items-center gap-4">
            <span>🔒 All Vaults Sealed</span>
            <span>⚡ Yield Cycling: Active</span>
            <span>🌀 Compounding: Enabled</span>
          </div>
          <div>MEGAZION Vault System v1.0</div>
        </div>
      </div>
    </div>
  );
};

export default MEGAZIONVaultDashboard;
