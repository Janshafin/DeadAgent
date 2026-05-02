'use client';

import React from 'react';
import { useWalletStore } from '@/lib/store/useWalletStore';

interface NavbarProps {
  onOpenWallet: () => void;
}

export function Navbar({ onOpenWallet }: NavbarProps) {
  const { isConnected, ensName, address } = useWalletStore();

  const displayName = isConnected
    ? ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`
    : null;

  return (
    <header className="w-full sticky top-0 z-50 border-b border-[#c9a84c]/30 bg-[#0A0A0B]/80 backdrop-blur-md flex justify-between items-center px-8 md:px-12 py-5">
      {/* Logo */}
      <div className="font-sans text-[14px] font-bold text-[#c9a84c] uppercase tracking-[0.3em]">
        DEADAGENT
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenWallet}
          className="border border-[#c9a84c]/30 rounded-sm px-5 py-2 font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-colors"
        >
          {displayName || 'Connect'}
        </button>
      </div>
    </header>
  );
}
