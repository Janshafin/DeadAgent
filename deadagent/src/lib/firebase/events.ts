import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  doc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AgentEvent, EventType } from '@/components/dashboard/activity/types';
import { AGENT_NODES } from '@/components/dashboard/activity/types';
import { firestoreWriteWithRetry } from './retryWrite';

// ── Helpers ────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

const EVENT_TYPES: EventType[] = ['heartbeat', 'axl_message', 'swap', 'warning'];

function buildMockEvent(index: number, spreadMs: number): AgentEvent {
  const now = Date.now();
  const type = pick(EVENT_TYPES);
  const agent = pick(AGENT_NODES);
  return {
    id: `evt-${now}-${index}`,
    agentEns: agent.ens,
    type,
    description: pick(DESCRIPTIONS[type]),
    timestamp: now - Math.floor(Math.random() * spreadMs),
  };
}

// ── Seed Firestore ─────────────────────────────────────────
/**
 * Seeds 20 mock events into /users/{uid}/events if the collection is empty.
 * Returns true if seeding was performed.
 */
export async function seedEventsIfEmpty(uid: string): Promise<boolean> {
  const eventsRef = collection(db, 'users', uid, 'events');
  const snap = await getDocs(query(eventsRef, limit(1)));

  if (!snap.empty) return false;

  const batch = writeBatch(db);
  for (let i = 0; i < 20; i++) {
    const evt = buildMockEvent(i, 86_400_000); // spread over 24 h
    const docRef = doc(eventsRef, evt.id);
    batch.set(docRef, evt);
  }
  await firestoreWriteWithRetry(() => batch.commit(), 'Event seed');
  return true;
}

// ── Real-time Listener ─────────────────────────────────────
/**
 * Subscribes to /users/{uid}/events with onSnapshot.
 * Calls `onData` every time the query snapshot changes.
 * Returns the unsubscribe function.
 */
export function subscribeToEvents(
  uid: string,
  onData: (events: AgentEvent[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const eventsRef = collection(db, 'users', uid, 'events');
  const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const events: AgentEvent[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          agentEns: data.agentEns ?? '',
          type: data.type ?? 'heartbeat',
          description: data.description ?? '',
          timestamp: data.timestamp ?? 0,
        } as AgentEvent;
      });
      onData(events);
    },
    (err) => {
      onError(err);
    },
  );
}

/**
 * Creates a single mock event and returns it (for local fallback injection).
 */
export function createSingleMockEvent(): AgentEvent {
  return { ...buildMockEvent(Date.now(), 0), timestamp: Date.now() };
}
