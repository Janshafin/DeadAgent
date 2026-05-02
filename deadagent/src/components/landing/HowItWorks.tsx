'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2L4 8V16C4 23.2 9.12 29.84 16 31.6C22.88 29.84 28 23.2 28 16V8L16 2Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M12 16L15 19L21 13" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Secure Your Vault',
    description: 'Connect your wallet and designate beneficiaries. Your cryptographic testament is encrypted on-chain with AXL-grade security.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 16H7L10 10L14 22L18 13L21 16H28" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="16" cy="16" r="14" stroke="#C9A84C" strokeWidth="1" strokeDasharray="2 4" opacity="0.3"/>
      </svg>
    ),
    title: 'Heartbeat Monitor',
    description: 'AI agents continuously verify your activity. Configurable check-in intervals from hours to months with multi-oracle consensus.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="14" width="16" height="14" rx="1" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
        <path d="M11 14V10C11 7.24 13.24 5 16 5C18.76 5 21 7.24 21 10V14" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="16" cy="21" r="2" fill="#C9A84C"/>
        <path d="M16 23V25" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Succession Trigger',
    description: 'When silence is confirmed, your digital estate automatically transfers to designated heirs with zero-knowledge proof validation.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: 'easeOut' as const,
    },
  }),
};

export function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[1200px] mx-auto px-6 py-32"
    >
      {/* Section header */}
      <div className="text-center mb-20 space-y-4">
        <span className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.3em]">
          Protocol Architecture
        </span>
        <h2 className="font-serif text-[40px] font-light text-[#e4e2e1]">
          How It Works
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="group relative bg-[#141415] border border-[#c9a84c]/0 hover:border-[#c9a84c]/30 p-10 flex flex-col gap-6 transition-all duration-500 hover:-translate-y-[2px]"
          >
            {/* Step number */}
            <span className="font-sans text-[10px] font-medium text-[#d0c5b2]/30 uppercase tracking-[0.3em]">
              Step {String(i + 1).padStart(2, '0')}
            </span>

            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center border border-[#c9a84c]/20 rounded-sm bg-[#0e0e0e] group-hover:border-[#c9a84c]/40 transition-colors duration-500">
              {step.icon}
            </div>

            {/* Content */}
            <h3 className="font-sans text-[14px] font-semibold text-[#e4e2e1] uppercase tracking-[0.15em]">
              {step.title}
            </h3>
            <p className="font-sans text-[14px] font-light leading-[1.7] tracking-[0.01em] text-[#d0c5b2]">
              {step.description}
            </p>

            {/* Corner accent (appears on hover) */}
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#c9a84c]/0 group-hover:border-[#c9a84c]/40 transition-colors duration-500" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
