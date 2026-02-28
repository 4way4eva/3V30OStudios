import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, CheckCircle } from 'lucide-react';
import useWallet from '../hooks/useWallet';

const CHAIN_COLORS = {
  Ethereum:  'bg-blue-600',
  Polygon:   'bg-purple-600',
  BSC:       'bg-yellow-600',
  Avalanche: 'bg-red-600',
  Hardhat:   'bg-gray-600',
};

const CopyAddress = ({ address }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-xs"
      title="Copy address"
    >
      {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
      {address.slice(0, 6)}…{address.slice(-4)}
    </button>
  );
};

const WalletConnect = ({ compact = false }) => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [open, setOpen] = useState(false);

  if (!wallet.connected) {
    return (
      <button
        onClick={connectWallet}
        className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600
          hover:opacity-90 active:scale-95 transition text-white font-semibold rounded-lg
          ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm w-full justify-center'}`}
      >
        <Wallet size={compact ? 13 : 15} />
        {compact ? 'Connect' : 'Connect Wallet'}
      </button>
    );
  }

  const chainColor = CHAIN_COLORS[wallet.chainName] || 'bg-gray-600';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600
          transition text-white rounded-lg ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm w-full'}`}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {!compact && (
          <span className={`text-xs px-1.5 py-0.5 rounded text-white font-semibold ${chainColor}`}>
            {wallet.chainName}
          </span>
        )}
        <span className="font-mono">
          {wallet.address?.slice(0, compact ? 4 : 6)}…{wallet.address?.slice(-3)}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Wallet size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Connected Wallet</div>
                  <div className={`text-xs px-1.5 py-0.5 rounded text-white font-semibold inline-block ${chainColor}`}>
                    {wallet.chainName}
                  </div>
                </div>
              </div>
              <CopyAddress address={wallet.address} />
            </div>

            <div className="p-2">
              <a
                href={`https://etherscan.io/address/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
              >
                <ExternalLink size={14} />
                View on Explorer
              </a>
              <button
                onClick={() => { disconnectWallet(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
