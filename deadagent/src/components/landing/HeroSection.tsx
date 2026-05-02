'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Generate 80 particles with deterministic positions and timing
const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${(i * 13.7) % 100}%`,
  top: `${(i * 17.3) % 100}%`,
  dur: `${10 + (i % 8) * 2}s`,
  delay: `${(i * 0.37) % 6}s`,
}));

interface HeroSectionProps {
  onOpenWallet: () => void;
}

export function HeroSection({ onOpenWallet }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Particle grid background */}
      <div className="absolute inset-0 particle-grid opacity-40 pointer-events-none z-0" />

      {/* 80 floating particles */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              ['--dur' as string]: p.dur,
              ['--delay' as string]: p.delay,
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h1 className="font-serif text-[clamp(40px,6vw,72px)] font-light italic leading-[1.1] tracking-[-0.02em] text-[#e4e2e1]">
            Your Legacy. Secured. Eternal.
          </h1>
          <p className="font-sans text-[16px] font-light leading-[1.6] tracking-[0.01em] text-[#d0c5b2] max-w-2xl mx-auto">
            The first decentralised succession protocol for AI agents and digital estates.
          </p>
        </motion.div>

        {/* CTA pair */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            onClick={onOpenWallet}
            className="bg-[#c9a84c] border border-[#c9a84c] text-[#503d00] font-sans text-[12px] font-medium uppercase tracking-[0.2em] py-4 px-8 rounded-sm hover:bg-[#e2c47a] hover:border-[#e2c47a] transition-colors min-w-[200px]"
          >
            Connect Wallet
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="bg-transparent border border-[#c9a84c]/30 text-[#c9a84c] font-sans text-[12px] font-medium uppercase tracking-[0.2em] py-4 px-8 rounded-sm hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-colors min-w-[200px]"
          >
            Read the Protocol
          </motion.button>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-sans text-[10px] font-medium text-[#d0c5b2] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-[#c9a84c]/60 to-transparent" />
      </motion.div>
    </section>
  );
}
