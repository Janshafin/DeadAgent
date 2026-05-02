'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { AgentEvent, EventType } from './types';

const TYPE_CONFIG: Record<EventType, { label: string; bg: string; text: string; dot: string }> = {
  heartbeat: {
    label: 'Heartbeat',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]',
  },
  axl_message: {
    label: 'AXL Message',
    bg: 'bg-sky-500/10 border-sky-500/30',
    text: 'text-sky-400',
    dot: 'bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.6)]',
  },
  swap: {
    label: 'Swap',
    bg: 'bg-[#c9a84c]/10 border-[#c9a84c]/30',
    text: 'text-[#c9a84c]',
    dot: 'bg-[#c9a84c] shadow-[0_0_4px_rgba(201,168,76,0.6)]',
  },
  warning: {
    label: 'Warning',
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.6)]',
  },
};

export function EventCard({ event }: { event: AgentEvent }) {
  const cfg = TYPE_CONFIG[event.type];
  const relativeTime = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });

  return (
    <div className="group bg-[#1b1c1c] border border-[#c9a84c]/10 hover:border-[#c9a84c]/30 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300">
      {/* Timestamp */}
      <span className="font-mono text-[10px] text-[#99907e] tracking-wider shrink-0 w-[100px]">
        {relativeTime}
      </span>

      {/* Agent ENS pill */}
      <span className="shrink-0 inline-flex items-center gap-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
        <span className="font-mono text-[10px] text-[#c9a84c] tracking-wider">
          {event.agentEns}
        </span>
      </span>

      {/* Type badge */}
      <span className={`shrink-0 inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className={`font-sans text-[10px] font-medium uppercase tracking-widest ${cfg.text}`}>
          {cfg.label}
        </span>
      </span>

      {/* Description */}
      <p className="font-sans text-[12px] font-light text-[#d0c5b2] leading-relaxed flex-1">
        {event.description}
      </p>
    </div>
  );
}
