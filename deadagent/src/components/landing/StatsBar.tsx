'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItemProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function StatItem({ label, value, prefix = '', suffix = '', decimals = 0 }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <div ref={ref} className="flex flex-col items-center space-y-2">
      <span className="font-serif text-[32px] font-light text-[#c9a84c]">
        {prefix}{formattedValue}{suffix}
      </span>
      <span className="font-sans text-[12px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}

export function StatsBar() {
  // In production these would come from Firestore
  // For now we use static values that match the Stitch design
  const stats = {
    agentCount: 14,
    totalValueUSD: 2.4,
    uptimeDays: 127,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-[1200px] mx-auto px-6"
    >
      <div className="border-t border-b border-[#c9a84c]/10 py-16 flex flex-wrap justify-center items-center gap-y-8 gap-x-12 md:gap-x-20">
        <StatItem label="Agents Protected" value={stats.agentCount} />

        {/* Separator dot */}
        <div className="hidden md:block w-1 h-1 bg-[#c9a84c]/30 rounded-sm" />

        <StatItem label="Value Secured" value={stats.totalValueUSD} prefix="$" suffix="M" decimals={1} />

        <div className="hidden md:block w-1 h-1 bg-[#c9a84c]/30 rounded-sm" />

        <StatItem label="Uptime Days" value={stats.uptimeDays} />
      </div>
    </motion.section>
  );
}
