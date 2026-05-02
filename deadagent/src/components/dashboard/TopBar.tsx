'use client';

import React from 'react';
import { HeartbeatDot } from './Sidebar';
import { useWalletStore } from '@/lib/store/useWalletStore';

export function TopBar() {
  const { ensName, address } = useWalletStore();
  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Vault');

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="bg-[#050505]/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-[#c9a84c]/30 flex justify-end items-center px-5 md:px-12 py-5">
      <div className="flex items-center gap-3">
        <HeartbeatDot status="active" />
        <span className="font-sans tracking-[0.15em] text-[#e4e2e1] text-[11px] md:text-[12px] uppercase hidden sm:inline">
          {greeting},&nbsp;
        </span>
        <span className="font-sans tracking-[0.15em] text-[#e4e2e1] text-[11px] md:text-[12px] uppercase">
          {displayName}
        </span>
      </div>
    </header>
  );
}
