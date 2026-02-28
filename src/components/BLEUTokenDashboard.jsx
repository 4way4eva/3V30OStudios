import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, ArrowRight, Globe, Flame, Lock, RefreshCw, ExternalLink } from 'lucide-react';
import useToast from '../hooks/useToast';

const TOKENS = [
  {
    symbol:    'BLEU',
    name:      'BLEU Coin',
    emoji:     '💙',
    color:     'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500/40',
    supply:    '1,000,000,000',
    circulating:'847,250,000',
    burned:    '12,500,000',
    price:     '$1.00',
    change24h: '+2.3%',
    positive:  true,
    marketCap: '$847.25M',
    networks:  ['Ethereum', 'Polygon', 'BSC', 'Avalanche'],
    standard:  'ERC-20',
    yieldBearing: false,
    description: 'The sovereign base currency of EV0LVERSE. Stable, sealed, and praise-embedded.',
  },
  {
    symbol:    'BLEU-C',
    name:      'BLEU Crown',
    emoji:     '👑',
    color:     'from-yellow-600 to-orange-600',
    borderColor: 'border-yellow-500/40',
    supply:    '100,000,000',
    circulating: '62,400,000',
    burned:    '3,200,000',
    price:     '$12.48',
    change24h: '+5.7%',
    positive:  true,
    marketCap: '$779.2M',
    networks:  ['Ethereum', 'Polygon'],
    standard:  'ERC-20',
    yieldBearing: true,
    description: 'Crown-tier governance and yield token. Holders earn compounding treasury distributions.',
  },
  {
    symbol:    'BTLLN',
    name:      'BlueTillion',
    emoji:     '🔷',
    color:     'from-teal-600 to-emerald-600',
    borderColor: 'border-teal-500/40',
    supply:    '1,000,000,000,000',
    circulating: '514,000,000,000',
    burned:    '84,000,000,000',
    price:     '$0.0001',
    change24h: '+0.8%',
    positive:  true,
    marketCap: '$51.4B',
    networks:  ['BSC', 'Polygon', 'Avalanche'],
    standard:  'BEP-20 / ERC-20',
    yieldBearing: false,
    description: 'High-supply circulating currency. Designed for micro-transactions and broad distribution.',
  },
  {
    symbol:    'BLEU-S',
    name:      'BLEU Sovereign',
    emoji:     '🏛️',
    color:     'from-purple-600 to-violet-600',
    borderColor: 'border-purple-500/40',
    supply:    '12,000,000',
    circulating: '8,700,000',
    burned:    '0',
    price:     '$144.00',
    change24h: '+1.2%',
    positive:  true,
    marketCap: '$1.25B',
    networks:  ['Ethereum'],
    standard:  'ERC-20',
    yieldBearing: true,
    description: 'Ultra-rare sovereign tier. Required for vault access and highest-level governance.',
  },
  {
    symbol:    'ENFT-Y',
    name:      'ENFT Yield Token',
    emoji:     '💎',
    color:     'from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500/40',
    supply:    '∞ (yield-minted)',
    circulating: '290,000,000',
    burned:    '4,800,000',
    price:     '$3.70',
    change24h: '+3.4%',
    positive:  true,
    marketCap: '$1.07B',
    networks:  ['Ethereum', 'Polygon'],
    standard:  'ERC-20',
    yieldBearing: true,
    description: 'Auto-minted from ENFT system yields. Redeemable for vault assets or governance.',
  },
  {
    symbol:    'PIHYA',
    name:      'PIHYA Tribunal Token',
    emoji:     '⚖️',
    color:     'from-rose-600 to-pink-600',
    borderColor: 'border-rose-500/40',
    supply:    '1,200,000',
    circulating: '1,200,000',
    burned:    '0',
    price:     '$4,200.00',
    change24h: '-0.5%',
    positive:  false,
    marketCap: '$5.04B',
    networks:  ['Ethereum'],
    standard:  'ERC-20 (Non-Transferable)',
    yieldBearing: true,
    description: 'Tribunal authority token. Held only by the 12 Governors. Non-transferable.',
  },
  {
    symbol:    'MEGAZION',
    name:      'MEGAZION',
    emoji:     '🔮',
    color:     'from-gray-600 to-slate-600',
    borderColor: 'border-gray-500/40',
    supply:    '48,000,000',
    circulating: '31,200,000',
    burned:    '480,000',
    price:     '$51.00',
    change24h: '+4.8%',
    positive:  true,
    marketCap: '$1.59B',
    networks:  ['Ethereum', 'Avalanche', 'BSC'],
    standard:  'ERC-20',
    yieldBearing: true,
    description: 'The 48-fold gem-backed sovereign expansion token. Each token maps to a MEGAZION gem.',
  },
];

const FLOW_STEPS = [
  { label: 'Praise Wind (ES0IL)', icon: '🌬️', color: 'bg-blue-700' },
  { label: 'ENFT Mint',          icon: '🖼️', color: 'bg-indigo-700' },
  { label: 'Vault Lock',         icon: '🏦', color: 'bg-green-700' },
  { label: 'Yield Generation',   icon: '💰', color: 'bg-yellow-700' },
  { label: 'Governor Approval',  icon: '⚖️', color: 'bg-orange-700' },
  { label: 'Distribution',       icon: '✨', color: 'bg-purple-700' },
];

// Mini sparkline using div bars
const Sparkline = ({ positive }) => {
  const data = Array.from({ length: 12 }, (_, i) =>
    40 + Math.sin(i * 0.8) * 20 + (positive ? i * 3 : -i * 2) + Math.random() * 8
  );
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${positive ? 'bg-green-500/50' : 'bg-red-500/50'}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const TokenCard = ({ token, onClick, selected }) => (
  <div
    onClick={() => onClick(token.symbol)}
    className={`rounded-xl p-4 border cursor-pointer transition-all ${token.borderColor}
      ${selected ? 'bg-slate-700 shadow-xl' : 'bg-slate-800 hover:bg-slate-750'}`}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{token.emoji}</span>
        <div>
          <div className="text-white font-bold">{token.symbol}</div>
          <div className="text-gray-400 text-xs">{token.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-bold">{token.price}</div>
        <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
          {token.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {token.change24h}
        </div>
      </div>
    </div>

    <Sparkline positive={token.positive} />

    <div className="mt-2 space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="text-gray-400">Market Cap</span>
        <span className="text-white font-semibold">{token.marketCap}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Standard</span>
        <span className="text-white">{token.standard}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Networks</span>
        <span className="text-white">{token.networks.length} chains</span>
      </div>
    </div>

    {token.yieldBearing && (
      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
        <TrendingUp size={10} /> Yield-Bearing
      </div>
    )}
  </div>
);

const TokenDetail = ({ token, onClose }) => {
  const toast = useToast();
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/40 mt-4">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{token.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{token.name}</h2>
            <div className="text-gray-400 text-sm">{token.description}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition">✕</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Price',       value: token.price,       icon: Coins },
          { label: 'Market Cap',  value: token.marketCap,   icon: TrendingUp },
          { label: 'Supply',      value: token.supply,      icon: Lock },
          { label: 'Burned',      value: token.burned,      icon: Flame },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
              <Icon size={12} /> {label}
            </div>
            <div className="text-white font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Globe size={14} /> Networks</h3>
          <div className="flex flex-wrap gap-2">
            {token.networks.map((n) => (
              <span key={n} className="badge badge-blue">{n}</span>
            ))}
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">Supply Distribution</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Supply</span>
              <span className="text-white">{token.supply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Circulating</span>
              <span className="text-green-400">{token.circulating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Burned</span>
              <span className="text-red-400">🔥 {token.burned}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => toast.info(`${token.symbol} purchase flow initiated`, 'Buy Token')}
          className="btn-primary"
        >
          <Coins size={14} /> Buy {token.symbol}
        </button>
        <button
          onClick={() => toast.info(`${token.symbol} chart opened`, 'Chart')}
          className="btn-secondary"
        >
          <TrendingUp size={14} /> Chart
        </button>
        <a
          href={`https://etherscan.io/token/0x0`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          <ExternalLink size={14} /> Explorer
        </a>
      </div>
    </div>
  );
};

const TokenFlowDiagram = () => (
  <div className="bg-slate-800 rounded-xl p-5">
    <h3 className="text-white font-bold mb-4">💰 Token Flow Architecture</h3>
    <div className="flex items-center gap-2 flex-wrap">
      {FLOW_STEPS.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className={`${step.color} rounded-lg px-3 py-2 text-center`}>
            <div className="text-xl">{step.icon}</div>
            <div className="text-white text-xs font-semibold mt-1 whitespace-nowrap">{step.label}</div>
          </div>
          {i < FLOW_STEPS.length - 1 && (
            <ArrowRight size={16} className="text-gray-500 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const BLEUTokenDashboard = () => {
  const [selected, setSelected] = useState(null);
  const [ticker, setTicker] = useState(0);

  // Simulated live price ticker
  useEffect(() => {
    const t = setInterval(() => setTicker((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const selectedToken = TOKENS.find((t) => t.symbol === selected);
  const totalMarketCap = '$61.5B';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💙</span>
              <div>
                <h1 className="text-3xl font-bold text-white">BLEU Token Ecosystem</h1>
                <p className="text-blue-100 text-sm">7 Sovereign Currencies · BlueTillion Active · Multi-Chain</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{totalMarketCap}</div>
              <div className="text-blue-200 text-sm flex items-center gap-1 justify-end">
                <RefreshCw size={10} className="animate-spin" />
                Total Market Cap (Live)
              </div>
            </div>
          </div>

          {/* Live ticker strip */}
          <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
            {TOKENS.map((t) => (
              <div key={t.symbol} className="flex items-center gap-1.5 text-xs shrink-0">
                <span>{t.emoji}</span>
                <span className="text-white font-mono font-semibold">{t.symbol}</span>
                <span className="text-gray-300">{t.price}</span>
                <span className={t.positive ? 'text-green-400' : 'text-red-400'}>{t.change24h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TOKENS.map((token) => (
            <TokenCard
              key={token.symbol}
              token={token}
              onClick={(sym) => setSelected((p) => (p === sym ? null : sym))}
              selected={selected === token.symbol}
            />
          ))}
        </div>

        {/* Token Detail */}
        {selectedToken && <TokenDetail token={selectedToken} onClose={() => setSelected(null)} />}

        {/* Flow Diagram */}
        <TokenFlowDiagram />

        {/* Multi-chain status */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Globe size={16} /> Multi-Chain Deployment</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Ethereum', 'Polygon', 'BSC', 'Avalanche', 'Cronos'].map((chain, i) => {
              const counts = [7, 5, 4, 4, 2];
              return (
                <div key={chain} className="bg-slate-700 rounded-lg p-3 text-center">
                  <div className="text-white font-semibold text-sm">{chain}</div>
                  <div className="text-green-400 text-xs mt-1">{counts[i]} tokens</div>
                  <div className="w-2 h-2 rounded-full bg-green-400 mx-auto mt-2 animate-pulse" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>💙 BLEU Base: STABLE</span>
            <span>🔷 BlueTillion: ACTIVE</span>
            <span>🔥 Burn Protocol: RUNNING</span>
          </div>
          <div>BLEU Ecosystem v1.0 · {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default BLEUTokenDashboard;
