'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentGrid, type Agent } from '@/components/dashboard/AgentGrid';

/* ── Demo agent data ────────────────────────────────────────── */
const DEMO_AGENTS: Agent[] = [
  {
    id: 'agent-guardian',
    ensName: 'guardian.deadagent.eth',
    status: 'Active',
    lastActive: 'Just now',
    memoryPercent: 82,
    icon: 'verified_user',
  },
  {
    id: 'agent-sentinel',
    ensName: 'sentinel.deadagent.eth',
    status: 'Active',
    lastActive: '5 min ago',
    memoryPercent: 56,
    icon: 'radar',
  },
  {
    id: 'agent-oracle',
    ensName: 'oracle.deadagent.eth',
    status: 'Warning',
    lastActive: '2 hr ago',
    memoryPercent: 34,
    icon: 'hub',
  },
  {
    id: 'agent-keeper',
    ensName: 'keeper.deadagent.eth',
    status: 'Active',
    lastActive: '12 min ago',
    memoryPercent: 91,
    icon: 'lock',
  },
  {
    id: 'agent-relay',
    ensName: 'relay.deadagent.eth',
    status: 'Offline',
    lastActive: '14d ago',
    memoryPercent: 12,
    icon: 'swap_horiz',
  },
];

/* ── Stat card data ─────────────────────────────────────────── */
const stats = [
  { label: 'Total Agents', value: '05', icon: 'memory' },
  { label: 'Active Now', value: '03', icon: 'radio_button_checked' },
  { label: 'Warnings', value: '01', icon: 'warning' },
  { label: 'Avg Uptime', value: '99.2%', icon: 'timer' },
];

export default function AgentsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'warning' | 'offline'>('all');

  const filtered = filter === 'all'
    ? DEMO_AGENTS
    : DEMO_AGENTS.filter((a) => a.status.toLowerCase() === filter);

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[32px] font-normal text-[#c9a84c]">
          Agent Protocol
        </h1>
        <p className="font-sans text-[12px] font-light text-[#d0c5b2] max-w-xl leading-relaxed tracking-[0.05em]">
          Monitor and manage your deployed succession agents. Each agent autonomously guards a segment of your digital estate.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-[#1b1c1c] border border-[#c9a84c]/15 rounded-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c9a84c]/50 text-[14px]">{s.icon}</span>
              <span className="font-sans text-[9px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em]">
                {s.label}
              </span>
            </div>
            <span className="font-serif text-[28px] font-light text-[#e4e2e1]">{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-[#c9a84c]/10 pb-0">
        {(['all', 'active', 'warning', 'offline'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`font-sans text-[10px] uppercase tracking-[0.2em] px-5 py-3 border-b-2 transition-all ${
              filter === tab
                ? 'text-[#c9a84c] border-[#c9a84c] font-bold'
                : 'text-[#99907e] border-transparent hover:text-[#c9a84c]/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <AgentGrid agents={filtered} />

      {/* Deploy new agent CTA */}
      <div className="flex items-center justify-center py-8">
        <button className="group flex items-center gap-3 border border-dashed border-[#c9a84c]/20 hover:border-[#c9a84c]/50 rounded-sm px-10 py-4 transition-all duration-300">
          <span className="material-symbols-outlined text-[#c9a84c]/40 group-hover:text-[#c9a84c] text-[18px] transition-colors">
            add_circle
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/40 group-hover:text-[#c9a84c] transition-colors">
            Deploy New Agent
          </span>
        </button>
      </div>
    </div>
  );
}
