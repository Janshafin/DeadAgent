export type EventType = 'heartbeat' | 'axl_message' | 'swap' | 'warning';

export interface AgentEvent {
  id: string;
  agentEns: string;
  type: EventType;
  description: string;
  timestamp: number; // epoch ms
}

export const AGENT_NODES = [
  { id: 'a1', ens: 'trader.deadagent.eth' },
  { id: 'a2', ens: 'vault.heritage.eth' },
  { id: 'a3', ens: 'cold.storage.eth' },
  { id: 'a4', ens: 'relay.axl.eth' },
  { id: 'a5', ens: 'sentinel.guard.eth' },
];

export type FilterTab = 'all' | 'heartbeat' | 'swap' | 'warning';
