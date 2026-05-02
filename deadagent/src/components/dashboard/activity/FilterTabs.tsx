'use client';

import React from 'react';
import type { FilterTab } from './types';

interface FilterTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'heartbeat', label: 'Heartbeats' },
  { key: 'swap', label: 'Swaps' },
  { key: 'warning', label: 'Warnings' },
];

export function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0A0A0B] border border-[#c9a84c]/10 rounded-sm p-1">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 rounded-sm font-sans text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2
              ${isActive
                ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30'
                : 'text-[#99907e] hover:text-[#d0c5b2] border border-transparent'
              }`}
          >
            {tab.label}
            <span className={`font-mono text-[9px] ${isActive ? 'text-[#c9a84c]/70' : 'text-[#555]'}`}>
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
