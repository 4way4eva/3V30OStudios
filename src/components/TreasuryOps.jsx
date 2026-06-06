import React, { useState } from 'react';
import {
  Vault, Coins, Users, ArrowRightLeft, FileBarChart,
  TrendingUp, ShieldCheck, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';

const formatCurrency = (value) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
};

const VAULT_DATA = {
  baseValue: 51_000_000_000_000,
  dailyYield: 1_100_000_000_000,
  currentBalance: 52_100_000_000_000,
  lastYield: new Date().toISOString(),
  governorApprovals: 12,
  pendingTransactions: 3,
};

const CURRENCIES = [
  { name: 'BlueTillion', symbol: 'BLU', supply: '144,000', value: '$363T', backed: 'Divine sovereign legacy covenant', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-700' },
  { name: 'AquaCoin', symbol: 'AC', supply: '1.2M', value: '$60B', backed: 'Sonic / water frequency value', color: 'text-cyan-400', bg: 'bg-cyan-900/30', border: 'border-cyan-700' },
  { name: 'HiveCoin', symbol: 'HC', supply: '3.4M', value: '$85B', backed: 'Pollination & collective intelligence', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  { name: 'FlameCoin', symbol: 'FC', supply: '890K', value: '$89B', backed: 'Ritual burn & transformation energy', color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700' },
  { name: 'IceCoin', symbol: 'IC', supply: '650K', value: '$48.75B', backed: 'Archival preservation & memory storage', color: 'text-sky-400', bg: 'bg-sky-900/30', border: 'border-sky-700' },
  { name: 'ChronoCoin', symbol: 'CC', supply: '420K', value: '$84B', backed: 'Temporal sovereignty & time-coded rights', color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-700' },
  { name: 'SolarCoin', symbol: 'SC', supply: '1.8M', value: '$270B', backed: 'Photon yield & solar frequency harvest', color: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-700' },
];

const GOVERNORS = [
  { id: 1, name: 'Adt0m', tribe: 'Genesis Council', region: 'North America', status: 'active' },
  { id: 2, name: 'Evolynn', tribe: 'Mirror Holders', region: 'Africa', status: 'active' },
  { id: 3, name: 'SkyyBleu', tribe: 'Wind Pilots', region: 'Caribbean', status: 'active' },
  { id: 4, name: 'Pihya', tribe: 'Configuration Core', region: 'Middle East', status: 'active' },
  { id: 5, name: 'Tru', tribe: 'Truth Coders', region: 'Europe', status: 'active' },
  { id: 6, name: 'Commander Bleu', tribe: 'Sovereign Command', region: 'Global', status: 'active' },
  { id: 7, name: 'Dr. Sosa', tribe: 'Reciprocal Order', region: 'Atlanta', status: 'active' },
  { id: 8, name: 'EL0V8', tribe: 'Cosmetics Guild', region: 'Asia', status: 'active' },
  { id: 9, name: 'MEGAZ', tribe: 'Vault Architects', region: 'South America', status: 'pending' },
  { id: 10, name: 'NeuroFiber', tribe: 'Gear Collective', region: 'Australia', status: 'active' },
  { id: 11, name: 'RainBubble', tribe: 'NPS Operators', region: 'Pacific', status: 'active' },
  { id: 12, name: 'SpiralCore', tribe: 'Fibonacci Senate', region: 'Antarctica', status: 'pending' },
];

const TRANSACTIONS = [
  { id: 'TX-2024-001', type: 'Yield Distribution', amount: 1_100_000_000_000, status: 'pending', governors: 8, timestamp: '2024-06-06T08:00:00Z', currency: 'BLU' },
  { id: 'TX-2024-002', type: 'Cross-Chain Bridge', amount: 48_750_000_000, status: 'pending', governors: 12, timestamp: '2024-06-06T10:30:00Z', currency: 'IC' },
  { id: 'TX-2024-003', type: 'Solar Harvest Reward', amount: 270_000_000_000, status: 'pending', governors: 5, timestamp: '2024-06-06T12:00:00Z', currency: 'SC' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: Vault },
  { id: 'currencies', label: 'Currencies', icon: Coins },
  { id: 'governors', label: 'Governors', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
];

const StatCard = ({ label, value, sub, color = 'text-blue-400' }) => (
  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const Overview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Total Vault Balance" value={formatCurrency(VAULT_DATA.currentBalance)} color="text-blue-400" sub="MetaVault 5100" />
      <StatCard label="Daily Yield" value={formatCurrency(VAULT_DATA.dailyYield)} color="text-green-400" sub="Auto-distributed" />
      <StatCard label="Base Reserve" value={formatCurrency(VAULT_DATA.baseValue)} color="text-purple-400" sub="Sovereign floor" />
      <StatCard label="Active Governors" value={VAULT_DATA.governorApprovals} color="text-yellow-400" sub="of 12 council seats" />
      <StatCard label="Pending Transactions" value={VAULT_DATA.pendingTransactions} color="text-orange-400" sub="Awaiting consensus" />
      <StatCard label="Currencies Managed" value={CURRENCIES.length} color="text-cyan-400" sub="Sovereign tokens" />
    </div>

    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-green-400" /> Treasury Health
      </h3>
      <div className="space-y-3">
        {[
          { label: 'Yield Rate', pct: 87, color: 'bg-green-500' },
          { label: 'Governor Consensus', pct: (VAULT_DATA.governorApprovals / 12) * 100, color: 'bg-blue-500' },
          { label: 'Vault Utilization', pct: 72, color: 'bg-purple-500' },
          { label: 'Cross-Chain Sync', pct: 95, color: 'bg-cyan-500' },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">{m.label}</span>
              <span className="text-slate-400">{m.pct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className={`${m.color} h-2 rounded-full transition-all`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Currencies = () => (
  <div className="grid md:grid-cols-2 gap-4">
    {CURRENCIES.map((c) => (
      <div key={c.symbol} className={`rounded-xl p-5 border ${c.bg} ${c.border}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className={`text-lg font-bold ${c.color}`}>{c.name}</div>
            <div className="text-xs text-slate-400 font-mono">${c.symbol}</div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-400">Supply: {c.supply}</div>
          </div>
        </div>
        <div className="text-xs text-slate-300 italic">{c.backed}</div>
      </div>
    ))}
  </div>
);

const Governors = () => (
  <div className="space-y-3">
    {GOVERNORS.map((g) => (
      <div key={g.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {g.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-200">{g.name}</div>
          <div className="text-xs text-slate-400">{g.tribe} · {g.region}</div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${g.status === 'active' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'}`}>
          {g.status === 'active' ? <span className="flex items-center gap-1"><CheckCircle size={10} /> Active</span> : <span className="flex items-center gap-1"><AlertCircle size={10} /> Pending</span>}
        </span>
      </div>
    ))}
  </div>
);

const Transactions = () => (
  <div className="space-y-4">
    {TRANSACTIONS.map((tx) => (
      <div key={tx.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-slate-200">{tx.type}</div>
            <div className="text-xs font-mono text-slate-500">{tx.id}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-400">{formatCurrency(tx.amount)}</div>
            <div className="text-xs text-slate-400">{tx.currency}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Users size={12} /> {tx.governors}/12 governors</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(tx.timestamp).toLocaleString()}</span>
          <span className="flex items-center gap-1 text-yellow-400"><AlertCircle size={12} /> {tx.status}</span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(tx.governors / 12) * 100}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1">{tx.governors}/12 approvals for consensus</div>
        </div>
      </div>
    ))}
  </div>
);

const Reports = () => {
  const totalValue = CURRENCIES.reduce((sum, c) => {
    const v = parseFloat(c.value.replace(/[$TBM,]/g, ''));
    const mult = c.value.includes('T') ? 1e12 : c.value.includes('B') ? 1e9 : 1e6;
    return sum + v * mult;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-green-400" /> Treasury Summary Report
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Report Date</span>
            <span className="text-slate-200">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Total MetaVault Balance</span>
            <span className="text-blue-400 font-bold">{formatCurrency(VAULT_DATA.currentBalance)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Combined Currency Market Cap</span>
            <span className="text-green-400 font-bold">{formatCurrency(totalValue)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Active Governors</span>
            <span className="text-yellow-400 font-bold">{GOVERNORS.filter(g => g.status === 'active').length} / 12</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Pending Transactions</span>
            <span className="text-orange-400 font-bold">{TRANSACTIONS.length}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Daily Yield Rate</span>
            <span className="text-purple-400 font-bold">{((VAULT_DATA.dailyYield / VAULT_DATA.baseValue) * 100).toFixed(4)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Currency Allocation</h3>
        <div className="space-y-2">
          {CURRENCIES.map((c) => (
            <div key={c.symbol} className="flex items-center gap-3">
              <span className={`text-xs font-mono w-8 ${c.color}`}>{c.symbol}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${c.bg.replace('/30', '')} border-0`}
                  style={{ width: `${Math.random() * 60 + 20}%`, background: 'currentColor' }}
                />
              </div>
              <span className="text-xs text-slate-400 w-16 text-right">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TAB_CONTENT = { overview: Overview, currencies: Currencies, governors: Governors, transactions: Transactions, reports: Reports };

const TreasuryOps = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            MetaVault 5100
          </h1>
          <p className="text-slate-400">Treasury Operations · Sovereign Currency Management</p>
          <div className="flex items-center justify-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live · {VAULT_DATA.governorApprovals} Governors Online
          </div>
        </div>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <Content />
      </div>
    </div>
  );
};

export default TreasuryOps;
