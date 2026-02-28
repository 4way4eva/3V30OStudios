import React, { useState } from 'react';
import { Scale, Users, Vote, FileText, CheckCircle, Clock, XCircle, ChevronDown, Send } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useToast from '../hooks/useToast';

const GOVERNORS = [
  { seat: 1,  name: 'Governor Sosa',        domain: 'Seal Authority',      status: 'active', voteWeight: 15, region: 'All Zones' },
  { seat: 2,  name: 'Governor SkyyBleu',    domain: 'EL0V8 + Butterfly',   status: 'active', voteWeight: 12, region: 'North America' },
  { seat: 3,  name: 'Governor Valor',       domain: 'Military Command',    status: 'active', voteWeight: 10, region: 'All Zones' },
  { seat: 4,  name: 'Governor Lyric',       domain: 'Praise & Culture',    status: 'active', voteWeight: 10, region: 'Africa Root' },
  { seat: 5,  name: 'Governor Crown',       domain: 'Treasury Ops',        status: 'active', voteWeight: 10, region: 'North America' },
  { seat: 6,  name: 'Governor Bliss',       domain: 'Inheritance',         status: 'active', voteWeight: 9,  region: 'Asia Lotus' },
  { seat: 7,  name: 'Governor Echo',        domain: 'Technology',          status: 'active', voteWeight: 9,  region: 'North America' },
  { seat: 8,  name: 'Governor Root',        domain: 'Ancestral Records',   status: 'active', voteWeight: 8,  region: 'Africa Root' },
  { seat: 9,  name: 'Governor Sol',         domain: 'ENFT Registry',       status: 'active', voteWeight: 8,  region: 'All Zones' },
  { seat: 10, name: 'Governor Aria',        domain: 'Education',           status: 'active', voteWeight: 7,  region: 'Asia Lotus' },
  { seat: 11, name: 'Governor Strike',      domain: 'Security',            status: 'active', voteWeight: 6,  region: 'All Zones' },
  { seat: 12, name: 'Governor Sovereign',   domain: 'Final Seal',          status: 'active', voteWeight: 6,  region: 'All Zones' },
];

const COUNCIL_LOG = [
  { id: 'LOG-048', date: '2026-02-25', event: 'BLEU Sovereign ENFT mint cap increase PASSED (11-0-1)', type: 'passed' },
  { id: 'LOG-047', date: '2026-02-20', event: 'Emergency praise pulse frequency doubled — APPROVED', type: 'passed' },
  { id: 'LOG-046', date: '2026-02-15', event: 'Africa Root Dome capacity expansion — UNDER REVIEW',   type: 'pending' },
  { id: 'LOG-045', date: '2026-02-10', event: 'Token burn protocol proposal DEFEATED (3-7-2)',         type: 'failed' },
  { id: 'LOG-044', date: '2026-02-05', event: 'SkyyBleu EL0V8 cosmetics line certified — APPROVED',   type: 'passed' },
];

const STATUS_META = {
  active:  { color: 'badge-blue',   icon: Clock,        label: 'Active' },
  passed:  { color: 'badge-green',  icon: CheckCircle,  label: 'Passed' },
  failed:  { color: 'badge-red',    icon: XCircle,      label: 'Failed' },
  pending: { color: 'badge-yellow', icon: Clock,        label: 'Pending' },
};

const VoteBar = ({ yes, no, abstain }) => {
  const total = yes + no + abstain || 12;
  return (
    <div className="space-y-1">
      <div className="flex gap-1 h-3 rounded overflow-hidden">
        <div className="bg-green-500 transition-all" style={{ width: `${(yes / total) * 100}%` }} title={`Yes: ${yes}`} />
        <div className="bg-red-500 transition-all" style={{ width: `${(no / total) * 100}%` }} title={`No: ${no}`} />
        <div className="bg-gray-600 transition-all" style={{ width: `${(abstain / total) * 100}%` }} title={`Abstain: ${abstain}`} />
      </div>
      <div className="flex gap-4 text-xs">
        <span className="text-green-400">✓ {yes} Yes</span>
        <span className="text-red-400">✕ {no} No</span>
        <span className="text-gray-500">— {abstain} Abstain</span>
      </div>
    </div>
  );
};

const ProposalCard = ({ proposal, onVote }) => {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[proposal.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-750 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <StatusIcon size={18} className={proposal.status === 'passed' ? 'text-green-400' : proposal.status === 'failed' ? 'text-red-400' : 'text-blue-400'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="font-semibold text-white text-sm">{proposal.title}</div>
            <span className={`badge ${meta.color} shrink-0`}>{meta.label}</span>
          </div>
          <div className="text-gray-500 text-xs mt-1">ID: {proposal.id} · Deadline: {proposal.deadline}</div>
        </div>
        <ChevronDown size={16} className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700/40 pt-4 space-y-4">
          <VoteBar {...proposal.votes} />
          {proposal.status === 'active' && (
            <div className="flex gap-2">
              <button onClick={() => onVote(proposal.id, 'yes')}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition">
                ✓ Vote Yes
              </button>
              <button onClick={() => onVote(proposal.id, 'no')}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg transition">
                ✕ Vote No
              </button>
              <button onClick={() => onVote(proposal.id, 'abstain')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded-lg transition">
                — Abstain
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GovernorCard = ({ gov }) => (
  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/40 hover:border-orange-500/40 transition">
    <div className="flex items-start justify-between mb-2">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {gov.seat}
      </div>
      <span className="badge badge-green text-xs">ACTIVE</span>
    </div>
    <div className="text-white font-bold text-sm mt-2">{gov.name}</div>
    <div className="text-gray-400 text-xs">{gov.domain}</div>
    <div className="text-gray-500 text-xs mt-1">{gov.region}</div>
    <div className="mt-2 flex items-center justify-between text-xs">
      <span className="text-gray-400">Vote Weight</span>
      <span className="text-orange-400 font-bold">{gov.voteWeight}%</span>
    </div>
    <div className="mt-1 w-full bg-slate-700 rounded-full h-1.5">
      <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-400" style={{ width: `${gov.voteWeight * 6.5}%` }} />
    </div>
  </div>
);

const GovernanceDashboard = () => {
  const { activeProposals } = useAppStore();
  const toast = useToast();
  const [view, setView] = useState('proposals');
  const [newProposal, setNewProposal] = useState('');

  const handleVote = (proposalId, vote) => {
    toast.success(`Vote "${vote}" cast on ${proposalId}`, 'Vote Submitted');
  };

  const handleSubmitProposal = () => {
    if (!newProposal.trim()) { toast.warning('Enter a proposal title.'); return; }
    toast.success('Proposal submitted to PIHYA Tribunal for review.', 'Proposal Created');
    setNewProposal('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-700 via-red-600 to-rose-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚖️</span>
              <div>
                <h1 className="text-3xl font-bold text-white">Governance Council</h1>
                <p className="text-orange-100 text-sm">12 Governors · Seal of Sosa · PIHYA Tribunal Authority</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">12/12</div>
              <div className="text-orange-200 text-sm">Governor Seats Filled</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Proposals',   value: activeProposals.filter((p) => p.status === 'active').length,  icon: '📋', color: 'text-blue-400' },
            { label: 'Passed This Month',  value: activeProposals.filter((p) => p.status === 'passed').length,  icon: '✅', color: 'text-green-400' },
            { label: 'Governors Active',   value: '12/12',                                                       icon: '👑', color: 'text-orange-400' },
            { label: 'Quorum Required',    value: '7/12',                                                        icon: '⚖️',  color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {['proposals', 'governors', 'council-log', 'submit'].map((v) => {
            const LABELS = { proposals: '📋 Proposals', governors: '👑 Governors', 'council-log': '📜 Council Log', submit: '✏️ Submit Proposal' };
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${view === v ? 'bg-orange-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
              >
                {LABELS[v]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {view === 'proposals' && (
          <div className="space-y-3">
            {activeProposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} onVote={handleVote} />
            ))}
          </div>
        )}

        {view === 'governors' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GOVERNORS.map((gov) => <GovernorCard key={gov.seat} gov={gov} />)}
          </div>
        )}

        {view === 'council-log' && (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            {COUNCIL_LOG.map((log, i) => {
              const meta = STATUS_META[log.type] || STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div key={log.id} className={`flex items-start gap-3 p-4 ${i < COUNCIL_LOG.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                  <Icon size={16} className={log.type === 'passed' ? 'text-green-400' : log.type === 'failed' ? 'text-red-400' : 'text-yellow-400'} />
                  <div className="flex-1">
                    <div className="text-white text-sm">{log.event}</div>
                    <div className="text-gray-500 text-xs">{log.id} · {log.date}</div>
                  </div>
                  <span className={`badge ${meta.color}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {view === 'submit' && (
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Submit New Proposal</h2>
            <p className="text-gray-400 text-sm mb-5">Proposals are reviewed by the PIHYA Tribunal before council vote. Requires a minimum praise level of 85%.</p>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-semibold block mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)}
                  placeholder="Describe your proposal..."
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="bg-orange-950/40 border border-orange-700/40 rounded-lg p-4 text-sm text-orange-300">
                ⚖️ All proposals must align with the Butterfly Protocol and SEED2WING™ compliance standards.
              </div>
              <button
                onClick={handleSubmitProposal}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                <Send size={16} /> Submit to Tribunal
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>🔏 Seal of Sosa: ACTIVE</span>
            <span>⚖️ PIHYA Tribunal: ARMED</span>
            <span>🗳️ Quorum: 7/12 governors</span>
          </div>
          <div>Governance System v1.0</div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
