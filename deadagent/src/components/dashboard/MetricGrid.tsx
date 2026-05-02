'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string;
  valueColor?: 'gold' | 'ivory';
  statusDot?: 'active' | 'warning' | 'critical' | null;
}

const dotColors = {
  active: 'bg-[#c9a84c] shadow-[0_0_4px_rgba(201,168,76,0.6)]',
  warning: 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]',
  critical: 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]',
};

export function MetricCard({ label, value, valueColor = 'gold', statusDot = null }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1b1c1c] border border-[#c9a84c]/20 rounded-sm p-8 flex flex-col gap-6 relative overflow-hidden group"
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Label */}
      <span className="font-sans text-[12px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em] relative z-10">
        {label}
      </span>

      {/* Value */}
      <div className="relative z-10 flex items-center gap-4 mt-auto">
        {statusDot && (
          <div className={`w-2 h-2 rounded-sm ${dotColors[statusDot]} heartbeat-pulse`} />
        )}
        <span className={`font-serif text-[48px] font-light leading-[1] ${
          valueColor === 'gold' ? 'text-[#c9a84c]' : 'text-[#e4e2e1]'
        }`}>
          {value}
        </span>
      </div>
    </motion.div>
  );
}

interface MetricGridProps {
  activeAgents: number;
  protectedAssets: string;
  heartbeatStatus: 'Active' | 'Warning' | 'Critical';
  daysUntilReview: number;
}

export function MetricGrid({ activeAgents, protectedAssets, heartbeatStatus, daysUntilReview }: MetricGridProps) {
  const statusMap: Record<string, 'active' | 'warning' | 'critical'> = {
    Active: 'active',
    Warning: 'warning',
    Critical: 'critical',
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Active Agents"
        value={String(activeAgents).padStart(2, '0')}
        valueColor="gold"
      />
      <MetricCard
        label="Protected Assets"
        value={protectedAssets}
        valueColor="gold"
      />
      <MetricCard
        label="Heartbeat Status"
        value={heartbeatStatus}
        valueColor="ivory"
        statusDot={statusMap[heartbeatStatus]}
      />
      <MetricCard
        label="Days Until Review"
        value={String(daysUntilReview)}
        valueColor="ivory"
      />
    </section>
  );
}
