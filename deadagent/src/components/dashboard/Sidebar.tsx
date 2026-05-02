'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/useWalletStore';

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', href: '/dashboard' },
  { icon: 'edit_note', label: 'Testament Editor', href: '/dashboard/testament' },
  { icon: 'shield', label: 'Agent Protocol', href: '/dashboard/agents' },
  { icon: 'insights', label: 'Activity Ledger', href: '/dashboard/activity' },
  { icon: 'settings', label: 'Vault Settings', href: '/dashboard/settings' },
];

interface HeartbeatDotProps {
  status: 'active' | 'warning' | 'critical';
  size?: 'sm' | 'md';
}

export function HeartbeatDot({ status, size = 'sm' }: HeartbeatDotProps) {
  const colorMap = {
    active: 'bg-[#c9a84c] shadow-[0_0_4px_rgba(201,168,76,0.8)]',
    warning: 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]',
    critical: 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]',
  };

  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <div className={`${sizeMap[size]} rounded-sm ${colorMap[status]} heartbeat-pulse`} />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { ensName, address } = useWalletStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  const navContent = (
    <>
      {/* Logo area */}
      <div className="px-8 mb-16 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-[#2a2a2a] rounded-sm border border-[#c9a84c]/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6V12C4 17.52 7.68 22.56 12 24C16.32 22.56 20 17.52 20 12V6L12 2Z" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.8"/>
              <circle cx="12" cy="12" r="3" fill="#C9A84C" opacity="0.6"/>
            </svg>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div>
          <h1 className="text-[16px] font-bold tracking-[0.2em] text-[#c9a84c] font-sans">DEADAGENT</h1>
          <p className="font-sans uppercase tracking-[0.2em] text-[10px] text-[#c9a84c]/60 mt-1">The Last Will Protocol</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 transition-all duration-300 rounded-sm ${
                isActive
                  ? 'text-[#c9a84c] font-bold border-r-2 border-[#c9a84c] bg-[#c9a84c]/5'
                  : 'text-neutral-500 hover:text-[#c9a84c]/70 hover:bg-neutral-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-sans uppercase tracking-[0.2em] text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Wallet at bottom */}
      <div className="px-8 mt-auto space-y-4">
        <div className="flex items-center gap-3 px-2">
          <HeartbeatDot status="active" size="md" />
          <span className="font-sans text-[10px] font-medium text-[#c9a84c]/60 uppercase tracking-[0.2em]">
            Heartbeat Active
          </span>
        </div>
        <div className="w-full py-3 px-4 border border-[#c9a84c]/20 rounded-sm text-center">
          <span className="font-sans text-[10px] font-medium text-[#c9a84c] uppercase tracking-[0.15em]">
            {displayName}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger trigger (mobile only) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-5 left-5 z-[60] w-10 h-10 bg-[#050505] border border-[#c9a84c]/30 rounded-sm flex items-center justify-center"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-[#c9a84c] text-[20px]">menu</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[55]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar — always visible */}
      <nav className="hidden md:flex bg-[#050505] h-screen w-64 border-r border-[#c9a84c]/30 flex-col py-8 shrink-0 sticky top-0">
        {navContent}
      </nav>

      {/* Mobile sidebar — slide in */}
      <nav
        className={`md:hidden fixed inset-y-0 left-0 z-[56] bg-[#050505] w-64 border-r border-[#c9a84c]/30 flex flex-col py-8 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </nav>
    </>
  );
}
