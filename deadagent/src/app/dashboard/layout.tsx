'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { DashboardSkeleton } from '@/components/ui/Skeletons';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isConnected, setWalletInfo } = useWalletStore();

  // Dev-mode bypass: auto-connect with demo address for testing
  useEffect(() => {
    if (IS_DEV && !isConnected) {
      setWalletInfo({
        address: '0xF181E84FD8273f6fd8bb9C32a67497cfCCdCa039',
        ensName: 'vault.deadagent.eth',
        isConnected: true,
        chainId: 1,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, setWalletInfo]);

  useEffect(() => {
    // Allow a tick for hydration before redirecting
    const timer = setTimeout(() => {
      if (!isConnected && !IS_DEV) {
        router.push('/');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isConnected, router]);

  // Show nothing while checking auth
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 bg-[#c9a84c] rounded-sm heartbeat-pulse" />
          <span className="font-sans text-[12px] text-[#d0c5b2] uppercase tracking-[0.2em]">
            Authenticating Vault...
          </span>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#131313]">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-y-auto p-5 md:p-12">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-[40px] md:gap-[80px]">
              <ErrorBoundary>
                <Suspense fallback={<DashboardSkeleton />}>
                  {children}
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
