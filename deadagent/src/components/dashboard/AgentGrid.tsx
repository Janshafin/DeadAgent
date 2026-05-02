'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Agent {
  id: string;
  ensName: string;
  status: 'Active' | 'Warning' | 'Offline';
  lastActive: string;
  memoryPercent: number;
  icon?: string;
}

const statusConfig = {
  Active: {
    color: 'text-[#c9a84c]',
    dotColor: 'bg-[#c9a84c] shadow-[0_0_2px_rgba(201,168,76,0.5)]',
    barColor: 'bg-[#c9a84c]',
    percentColor: 'text-[#c9a84c]',
    opacity: '',
  },
  Warning: {
    color: 'text-amber-500',
    dotColor: 'bg-amber-500 shadow-[0_0_2px_rgba(245,158,11,0.5)]',
    barColor: 'bg-amber-500',
    percentColor: 'text-amber-500',
    opacity: '',
  },
  Offline: {
    color: 'text-[#99907e]',
    dotColor: 'bg-[#99907e]',
    barColor: 'bg-[#99907e]',
    percentColor: 'text-[#99907e]',
    opacity: 'opacity-60 hover:opacity-100',
  },
};

function AgentCard({ agent }: { agent: Agent }) {
  const cfg = statusConfig[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-[#1b1c1c] border border-[#c9a84c]/20 rounded-sm flex flex-col hover:border-[#c9a84c]/50 transition-all duration-500 ${cfg.opacity}`}
    >
      <div className="p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] font-medium text-[#d0c5b2] tracking-[0.2em] uppercase">
              Target ENS
            </span>
            <h3 className="font-sans text-[14px] font-semibold text-[#e4e2e1] tracking-[0.15em] lowercase">
              {agent.ensName}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-sm border border-[#c9a84c]/30 flex items-center justify-center bg-[#2a2a2a]">
            <span className="material-symbols-outlined text-[#c9a84c] text-[16px]">
              {agent.icon || 'memory'}
            </span>
          </div>
        </div>

        {/* Status rows */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#c9a84c]/10 pb-2">
            <span className="font-sans text-[12px] font-light text-[#d0c5b2]">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-sm ${cfg.dotColor}`} />
              <span className={`font-sans text-[10px] font-medium uppercase ${cfg.color}`}>
                {agent.status}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-[#c9a84c]/10 pb-2">
            <span className="font-sans text-[12px] font-light text-[#d0c5b2]">Last Pulse</span>
            <span className="font-sans text-[10px] font-medium text-[#e4e2e1] uppercase">
              {agent.lastActive}
            </span>
          </div>
        </div>
      </div>

      {/* Memory bar */}
      <div className="mt-auto px-8 pb-8 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-sans text-[9px] font-medium text-[#d0c5b2] uppercase tracking-[0.15em]">
            Memory allocation
          </span>
          <span className={`font-sans text-[9px] font-medium uppercase ${cfg.percentColor}`}>
            {agent.memoryPercent}%
          </span>
        </div>
        <div className="h-[2px] w-full bg-[#353535] rounded-full overflow-hidden">
          <div
            className={`h-full ${cfg.barColor} rounded-full transition-all duration-1000`}
            style={{ width: `${agent.memoryPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="col-span-full flex flex-col items-center justify-center py-24 gap-8"
    >
      <div className="w-16 h-16 border border-[#c9a84c]/20 rounded-sm flex items-center justify-center bg-[#141415]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L4 8V16C4 23.2 9.12 29.84 16 31.6C22.88 29.84 28 23.2 28 16V8L16 2Z" stroke="#C9A84C" strokeWidth="1" opacity="0.4" fill="none"/>
          <path d="M12 16H20M16 12V20" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="text-center space-y-3">
        <h3 className="font-serif text-[24px] font-light text-[#e4e2e1] italic">
          No agents deployed yet
        </h3>
        <p className="font-sans text-[14px] font-light text-[#d0c5b2] max-w-sm">
          Deploy your first succession agent to begin protecting your digital estate.
        </p>
      </div>
      <button className="bg-[#c9a84c] border border-[#c9a84c] text-[#503d00] font-sans text-[12px] font-medium uppercase tracking-[0.2em] py-3 px-8 rounded-sm hover:bg-[#e2c47a] transition-colors">
        Create First Agent
      </button>
    </motion.div>
  );
}

interface AgentGridProps {
  agents: Agent[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  return (
    <section className="flex flex-col gap-12">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-[#c9a84c]/10 pb-4">
        <h2 className="font-serif text-[32px] font-normal text-[#c9a84c]">
          Deployed Protocols
        </h2>
        <button className="font-sans text-[12px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em] hover:text-[#c9a84c] transition-colors flex items-center gap-2">
          <span>View Ledger</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.length > 0 ? (
          agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
