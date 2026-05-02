import { AgentEvent, EventType, AGENT_NODES } from './types';

const DESCRIPTIONS: Record<EventType, string[]> = {
  heartbeat: [
    'Heartbeat confirmed — vitals nominal.',
    'Pulse verified. All systems operational.',
    'Routine liveness check passed.',
    'Heartbeat acknowledged by consensus layer.',
  ],
  axl_message: [
    'Cross-chain relay dispatched via Axelar GMP.',
    'AXL message bridged to Avalanche successfully.',
    'Inter-chain payload delivered — 0 retries.',
    'Relayed testament hash to Polygon destination.',
  ],
  swap: [
    'Rebalanced 0.4 ETH → 820 USDC on Uniswap V3.',
    'Executed DCA: 0.1 ETH → WBTC.',
    'Treasury swap: 500 USDC → DAI via 1inch.',
    'Automated yield harvest — compounded to vault.',
  ],
  warning: [
    'Gas spike detected — deferring non-critical txns.',
    'Heartbeat latency exceeded 12 h threshold.',
    'Unusual withdrawal pattern flagged for review.',
    'Oracle price deviation > 5 % — pausing swaps.',
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockEvents(count: number): AgentEvent[] {
  const now = Date.now();
  const types: EventType[] = ['heartbeat', 'axl_message', 'swap', 'warning'];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const agent = pick(AGENT_NODES);
    return {
      id: `evt-${now}-${i}`,
      agentEns: agent.ens,
      type,
      description: pick(DESCRIPTIONS[type]),
      // spread events across last 24 hours
      timestamp: now - Math.floor(Math.random() * 86_400_000),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}
