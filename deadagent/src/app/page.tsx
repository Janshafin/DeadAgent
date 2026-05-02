'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SponsorsStrip } from '@/components/landing/SponsorsStrip';
import { WalletModal } from '@/components/wallet/WalletModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="noise-bg min-h-screen flex flex-col">
      <Navbar onOpenWallet={() => setIsModalOpen(true)} />

      <main className="flex-grow flex flex-col">
        {/* HERO */}
        <HeroSection onOpenWallet={() => setIsModalOpen(true)} />

        {/* STATS BAR */}
        <StatsBar />

        {/* HOW IT WORKS */}
        <HowItWorks />

        {/* SPONSORS */}
        <SponsorsStrip />

        {/* Footer */}
        <footer className="w-full max-w-[1200px] mx-auto px-6 py-16 flex flex-col items-center gap-4">
          <div className="w-12 h-px bg-[#c9a84c]/20" />
          <span className="font-sans text-[10px] font-medium text-[#d0c5b2]/30 uppercase tracking-[0.3em]">
            © 2026 DeadAgent Protocol · All Rights Reserved
          </span>
        </footer>
      </main>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
