import React, { useState } from 'react';
import { Crown, Shield, Coins, Database, FileText, Zap, Globe, Lock, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const MasterDashboard = () => {
  const [selectedSystem, setSelectedSystem] = useState('overview');

  const systems = {
    treasury: {
      name: 'MetaVault 5100',
      status: 'operational',
      value: '$51T base + $1.1T/day yield',
      address: '0x7f0Dd46AF669298a835DEcD96f326E0900676609',
      health: 100
    },
    enft: {
      name: 'ENFT System',
      status: 'operational',
      minted: '12,847 assets',
      standard: 'QUA-OCTABIND v1.0',
      health: 98
    },
    legal: {
      name: 'Sovereignty Claims',
      status: 'sealed',
      claims: '3 active registries',
      enforcement: 'PIHYA Tribunal',
      health: 100
    },
    technical: {
      name: 'Infrastructure',
      status: 'operational',
      components: 'MEGAZION + Divine Insect Core',
      uptime: '99.97%',
      health: 99
    },
    governance: {
      name: '12 Governors',
      status: 'active',
      seats: '12/12 filled',
      authority: 'Seal of Sosa',
      health: 100
    },
    currency: {
      name: 'Currency Systems',
      status: 'operational',
      coins: '7 sovereign currencies',
      circulation: 'BlueTillion active',
      health: 97
    }
  };

  const recentActivity = [
    { time: '2 min ago', event: 'Treasury yield cycle completed', type: 'success' },
    { time: '15 min ago', event: 'ENFT batch minted: Genesis Seals #100-150', type: 'success' },
    { time: '1 hour ago', event: 'Sovereignty claim filed: MEGAZION system', type: 'warning' },
    { time: '3 hours ago', event: 'Governor council meeting: Zone redistribution', type: 'info' },
    { time: '6 hours ago', event: 'Divine Insect flight test: SSS mode activated', type: 'success' }
  ];

  const StatusBadge = ({ status }) => {
    const colors = {
      operational: 'bg-green-500',
      active: 'bg-blue-500',
      sealed: 'bg-purple-500',
      warning: 'bg-yellow-500'
    };
    return (
      <span className={`${colors[status] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const HealthBar = ({ health }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${health >= 95 ? 'bg-green-500' : health >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
        style={{ width: `${health}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Crown size={48} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">EV0LVERSE MASTER CONTROL</h1>
                <p className="text-yellow-100">Unified System Operations Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">$52.1T</div>
              <div className="text-sm text-yellow-100">Total System Value</div>
            </div>
          </div>
        </div>

        {/* System Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(systems).map(([key, system]) => (
            <div
              key={key}
              className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition border-2 border-transparent hover:border-blue-500"
              onClick={() => setSelectedSystem(key)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{system.name}</h3>
                  </div>
                  <StatusBadge status={system.status} />
                </div>
                <div className={`text-2xl ${system.health >= 95 ? 'text-green-400' : system.health >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {system.health}%
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-300 mb-3">
                {Object.entries(system).map(([k, v]) => {
                  if (k === 'name' || k === 'status' || k === 'health') return null;
                  return (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}:</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  );
                })}
              </div>

              <HealthBar health={system.health} />
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-700 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.event}</div>
                  <div className="text-gray-400 text-sm">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <Coins size={20} />
            Treasury Ops
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <Database size={20} />
            ENFT Minting
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <FileText size={20} />
            Legal Docs
          </button>
          <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <Shield size={20} />
            Governance
          </button>
        </div>

        {/* System Details Panel */}
        {selectedSystem !== 'overview' && (
          <div className="mt-6 bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {systems[selectedSystem]?.name} - Detailed View
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded">
                <h3 className="text-lg font-bold text-white mb-2">Configuration</h3>
                <pre className="text-gray-300 text-sm overflow-auto">
{JSON.stringify(systems[selectedSystem], null, 2)}
                </pre>
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <h3 className="text-lg font-bold text-white mb-2">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    View Detailed Logs
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Run Diagnostics
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                    Export Reports
                  </button>
                  <button className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Status */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-1">
                <Lock size={16} className="text-green-500" />
                All Systems Secured
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
                PPPPI Sealed
              </span>
              <span className="flex items-center gap-1">
                <Zap size={16} className="text-yellow-500" />
                Γ = 8.142886461618948
              </span>
            </div>
            <div className="text-gray-400">
              Last sync: Just now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
