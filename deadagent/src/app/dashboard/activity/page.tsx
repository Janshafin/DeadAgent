'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { EventCard } from '@/components/dashboard/activity/EventCard';
import { FilterTabs } from '@/components/dashboard/activity/FilterTabs';
import { generateMockEvents } from '@/components/dashboard/activity/mockEvents';
import {
  seedEventsIfEmpty,
  subscribeToEvents,
  createSingleMockEvent,
} from '@/lib/firebase/events';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { FeedSkeleton, SkeletonBlock } from '@/components/ui/Skeletons';
import { useUniswap } from '@/hooks/useUniswap';
import type { AgentEvent, FilterTab } from '@/components/dashboard/activity/types';

const AXLMeshVisualiser = dynamic(
  () => import('@/components/dashboard/activity/AXLMeshVisualiser').then((m) => m.AXLMeshVisualiser),
  { ssr: false, loading: () => <SkeletonBlock height="320px" /> },
);

export default function ActivityPage() {
  const { address } = useWalletStore();
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  
  const { simulateSuccessionSwap, isSwapping, txHash: uniswapTxHash } = useUniswap();

  const uid = address || 'demo-user';

  // ── Real-time Firestore listener with mock fallback ──────
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function init() {
      // Race Firestore init against a timeout — mock credentials cause the
      // SDK to hang indefinitely, so we cap the wait at 4 seconds.
      const FIRESTORE_TIMEOUT_MS = 4000;

      const firestoreReady = new Promise<void>((resolve, reject) => {
        (async () => {
          try {
            // 1. Seed 20 events into Firestore if the collection is empty
            await seedEventsIfEmpty(uid);

            // 2. Attach onSnapshot real-time listener
            unsubscribe = subscribeToEvents(
              uid,
              (firestoreEvents) => {
                if (cancelled) return;
                setEvents(firestoreEvents);
                setIsFirestoreLive(true);
                setIsLoading(false);
                resolve();
              },
              (err) => {
                reject(err);
              },
            );
          } catch (err) {
            reject(err);
          }
        })();
      });

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore connection timed out')), FIRESTORE_TIMEOUT_MS),
      );

      try {
        await Promise.race([firestoreReady, timeout]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Firestore unavailable, using mock fallback:', msg);
        if (!cancelled) fallbackToMock();
      }
    }

    function fallbackToMock() {
      setIsFirestoreLive(false);
      const seeded = generateMockEvents(20);
      setEvents(seeded);
      setIsLoading(false);

      // Simulate real-time: inject a new event every 8 seconds
      fallbackInterval = setInterval(() => {
        setEvents((prev) => {
          const evt = createSingleMockEvent();
          return [evt, ...prev].slice(0, 50);
        });
      }, 8000);
    }

    init();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [uid]);

  // ── Client-side filtering ────────────────────────────────
  const filtered = useMemo(() => {
    let result = events;

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter((e) => e.type === activeTab);
    }

    // Agent filter from mesh click
    if (selectedAgent) {
      result = result.filter((e) => e.agentEns === selectedAgent);
    }

    return result;
  }, [events, activeTab, selectedAgent]);

  // Count for tab badges
  const counts = useMemo(() => {
    const base = selectedAgent ? events.filter((e) => e.agentEns === selectedAgent) : events;
    return {
      all: base.length,
      heartbeat: base.filter((e) => e.type === 'heartbeat').length,
      swap: base.filter((e) => e.type === 'swap').length,
      warning: base.filter((e) => e.type === 'warning').length,
    };
  }, [events, selectedAgent]);

  const latestTimestamp = events.length > 0 ? events[0].timestamp : 0;

  // ── Manual event injection (for demo / testing checkpoint) ──
  const handleInjectEvent = useCallback(async () => {
    // If Firestore is live, write directly — onSnapshot will pick it up
    if (isFirestoreLive) {
      try {
        const { doc, setDoc, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        const evt = createSingleMockEvent();
        const eventsRef = collection(db, 'users', uid, 'events');
        await setDoc(doc(eventsRef, evt.id), evt);
        // No need to setEvents — onSnapshot fires automatically
        return;
      } catch {
        // fall through to local injection
      }
    }
    // Local fallback injection
    setEvents((prev) => {
      const evt = createSingleMockEvent();
      return [evt, ...prev].slice(0, 50);
    });
  }, [isFirestoreLive, uid]);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[32px] font-normal text-[#c9a84c]">
              Activity Ledger
            </h1>
            {/* Live badge */}
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-emerald-400">
                Live
              </span>
            </span>
            {/* Connection indicator */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-[9px] font-mono uppercase tracking-wider
              ${isFirestoreLive
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
              {isFirestoreLive ? 'Firestore' : 'Local Mock'}
            </span>
          </div>
          <p className="font-sans text-[12px] font-light text-[#d0c5b2] tracking-[0.05em]">
            Real-time event stream from all deployed agents.
            {selectedAgent && (
              <button
                onClick={() => setSelectedAgent(null)}
                className="ml-2 text-[#c9a84c] hover:text-[#e2c47a] underline underline-offset-2 transition-colors"
              >
                Clear agent filter
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={simulateSuccessionSwap}
            disabled={isSwapping}
            className="flex items-center gap-2 border border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 rounded-sm px-4 py-2 transition-all duration-300 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-purple-400 text-[16px]">swap_horiz</span>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-purple-400">
              {isSwapping ? 'Swapping...' : 'Simulate Token Swap'}
            </span>
          </button>
          <button
            onClick={handleInjectEvent}
            className="flex items-center gap-2 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 bg-[#c9a84c]/5 hover:bg-[#c9a84c]/10 rounded-sm px-4 py-2 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-[#c9a84c] text-[16px]">add_circle</span>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#c9a84c]">
              Inject Event
            </span>
          </button>
          <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts} />
        </div>
      </div>

      {/* Uniswap TX Hash Banner */}
      {uniswapTxHash && (
        <div className="bg-[#1b1c1c] border border-purple-500/30 rounded-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-400 text-[24px]">verified</span>
            <div className="flex flex-col">
              <span className="font-sans text-[12px] font-medium text-purple-400 uppercase tracking-widest">
                Succession Swap Executed
              </span>
              <span className="font-sans text-[10px] text-[#d0c5b2] tracking-wide">
                WETH has been successfully swapped to USDC on Uniswap V3.
              </span>
            </div>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_ETHERSCAN_BASE}${uniswapTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-4 tracking-wider"
          >
            View on Sepolia Etherscan
          </a>
        </div>
      )}

      {/* AXL Mesh Visualiser */}
      <div className="bg-[#1b1c1c] border border-[#c9a84c]/10 rounded-sm overflow-hidden relative">
        <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
          <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-[#c9a84c]/60">
            AXL Mesh — Agent Topology
          </span>
        </div>
        <div className="h-[320px]">
          <AXLMeshVisualiser
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            latestEventTimestamp={latestTimestamp}
          />
        </div>
        {selectedAgent && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0A0A0B]/90 border border-[#c9a84c]/20 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <span className="font-mono text-[10px] text-[#c9a84c] tracking-wider">
              Filtering: {selectedAgent}
            </span>
          </div>
        )}
      </div>

      {/* Event Feed */}
      <section className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <EmptyState
            icon="filter_alt"
            title="No Matching Events"
            description="No events match the current filter. Try selecting a different tab or clearing the agent filter."
            ctaLabel="View All Events"
            onCta={() => { setActiveTab('all'); setSelectedAgent(null); }}
          />
        )}
      </section>
    </div>
  );
}
