'use client';

import React, { useEffect, useState } from 'react';
import { MetricGrid } from '@/components/dashboard/MetricGrid';
import { AgentGrid, Agent } from '@/components/dashboard/AgentGrid';

// ─── Mock data (simulates Firestore /users/{uid}/stats and /users/{uid}/agents) ───
const MOCK_STATS = {
  activeAgents: 3,
  protectedAssets: '0.50 ETH',
  heartbeatStatus: 'Active' as const,
  daysUntilReview: 12,
};

const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    ensName: 'trader.deadagent.eth',
    status: 'Active',
    lastActive: '2h ago',
    memoryPercent: 74,
    icon: 'memory',
  },
  {
    id: '2',
    ensName: 'vault.heritage.eth',
    status: 'Active',
    lastActive: '5m ago',
    memoryPercent: 32,
    icon: 'account_balance',
  },
  {
    id: '3',
    ensName: 'cold.storage.eth',
    status: 'Offline',
    lastActive: '14d ago',
    memoryPercent: 12,
    icon: 'ac_unit',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial Firestore read
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setAgents(MOCK_AGENTS);
      setIsLoading(false);
    }, 400);

    // Simulate real-time Firestore onSnapshot listener
    // In production: onSnapshot(doc(db, 'users', address, 'agents'), ...)
    const snapshotInterval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === 'Active') {
            // Simulate real-time agent memory fluctuation and pulse
            return {
              ...agent,
              memoryPercent: Math.min(100, Math.max(0, agent.memoryPercent + (Math.random() > 0.5 ? 1 : -1))),
              lastActive: 'Just now',
            };
          }
          return agent;
        })
      );
    }, 3000);

    // Simulate real-time heartbeat status checking
    const heartbeatInterval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        // In production this checks actual timestamp diffs from Firebase
        heartbeatStatus: 'Active',
      }));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(snapshotInterval);
      clearInterval(heartbeatInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 bg-[#c9a84c] rounded-sm heartbeat-pulse" />
          <span className="font-sans text-[12px] text-[#d0c5b2] uppercase tracking-[0.2em]">
            Loading Vault Data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Metric Cards */}
      <MetricGrid
        activeAgents={stats.activeAgents}
        protectedAssets={stats.protectedAssets}
        heartbeatStatus={stats.heartbeatStatus}
        daysUntilReview={stats.daysUntilReview}
      />

      {/* Agent Cards Grid */}
      <AgentGrid agents={agents} />
    </>
  );
}
