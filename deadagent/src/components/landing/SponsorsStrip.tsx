'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sponsors = [
  '0G Storage',
  'Gensyn AXL',
  'ENS',
  'KeeperHub',
  'Uniswap',
];

function SponsorLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-10 py-4 shrink-0">
      <span className="font-sans text-[14px] font-semibold text-[#d0c5b2]/40 uppercase tracking-[0.2em] whitespace-nowrap hover:text-[#c9a84c]/60 transition-colors duration-500 cursor-default">
        {name}
      </span>
    </div>
  );
}

export function SponsorsStrip() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      className="w-full border-t border-b border-[#c9a84c]/10 py-8 overflow-hidden"
    >
      {/* Label */}
      <div className="text-center mb-6">
        <span className="font-sans text-[10px] font-medium text-[#d0c5b2]/30 uppercase tracking-[0.3em]">
          Integrated With
        </span>
      </div>

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none" />

        {/* Scrolling track — doubled for seamless loop */}
        <div className="marquee-track">
          {/* First set */}
          {sponsors.map((name) => (
            <SponsorLogo key={`a-${name}`} name={name} />
          ))}
          {/* Separator */}
          <div className="flex items-center px-4">
            <div className="w-1 h-1 bg-[#c9a84c]/20 rounded-sm" />
          </div>
          {/* Second set (duplicate for seamless loop) */}
          {sponsors.map((name) => (
            <SponsorLogo key={`b-${name}`} name={name} />
          ))}
          <div className="flex items-center px-4">
            <div className="w-1 h-1 bg-[#c9a84c]/20 rounded-sm" />
          </div>
          {/* Third set for extra coverage */}
          {sponsors.map((name) => (
            <SponsorLogo key={`c-${name}`} name={name} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
