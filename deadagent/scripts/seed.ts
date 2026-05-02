/**
 * Demo Data Seed Script
 * ─────────────────────
 * Populates Firestore with demo data: 3 agents, 1 testament, 20 events.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires FIREBASE_* env vars to be set (reads from .env.local via dotenv).
 */

/* eslint-disable @typescript-eslint/no-require-imports */
// Load .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  writeBatch,
} from 'firebase/firestore';

// ── Firebase init ──────────────────────────────────────────
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

// ── Constants ──────────────────────────────────────────────
const DEMO_UID = '0xdead000000000000000000000000000000000000';

const AGENTS = [
  {
    id: 'agent-guardian',
    ens: 'guardian.deadagent.eth',
    role: 'Executor',
    status: 'active',
    lastHeartbeat: Date.now() - 60_000,
    chain: 'Ethereum',
    tvl: 12.5,
  },
  {
    id: 'agent-sentinel',
    ens: 'sentinel.deadagent.eth',
    role: 'Monitor',
    status: 'active',
    lastHeartbeat: Date.now() - 300_000,
    chain: 'Polygon',
    tvl: 3.2,
  },
  {
    id: 'agent-oracle',
    ens: 'oracle.deadagent.eth',
    role: 'Oracle',
    status: 'warning',
    lastHeartbeat: Date.now() - 7_200_000,
    chain: 'Arbitrum',
    tvl: 0.8,
  },
];

const EVENT_TYPES = ['heartbeat', 'axl_message', 'swap', 'warning'] as const;

const EVENT_DESCRIPTIONS: Record<(typeof EVENT_TYPES)[number], string[]> = {
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

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Seed Functions ─────────────────────────────────────────

async function seedAgents() {
  console.log('  Seeding 3 agents...');
  for (const agent of AGENTS) {
    await setDoc(doc(db, 'users', DEMO_UID, 'agents', agent.id), agent);
  }
}

async function seedTestament() {
  console.log('  Seeding 1 testament...');
  const testament = {
    owner: DEMO_UID,
    allocations: { eth: 60, erc20: 40 },
    instructions: 'Upon trigger, distribute ETH reserves to primary heir. ERC-20 holdings to be liquidated via Uniswap and bridged to Polygon heir wallet.',
    heirs: [
      '0x1234567890123456789012345678901234567890',
      '0xABCDEF0123456789ABCDEF0123456789ABCDEF01',
    ],
    trigger: 'inactivity_90',
    useZeroG: true,
    status: 'sealed',
    blob: Buffer.from(JSON.stringify({ mock: true, seeded: true })).toString('base64'),
    updatedAt: new Date().toISOString(),
    timestamp: Date.now(),
  };
  await setDoc(doc(db, 'testaments', DEMO_UID), testament);
}

async function seedEvents() {
  console.log('  Seeding 20 events...');
  const batch = writeBatch(db);
  const eventsRef = collection(db, 'users', DEMO_UID, 'events');

  for (let i = 0; i < 20; i++) {
    const type = pick(EVENT_TYPES);
    const agent = pick(AGENTS);
    const evt = {
      id: `seed-evt-${Date.now()}-${i}`,
      agentEns: agent.ens,
      type,
      description: pick(EVENT_DESCRIPTIONS[type]),
      timestamp: Date.now() - Math.floor(Math.random() * 86_400_000),
    };
    batch.set(doc(eventsRef, evt.id), evt);
  }

  await batch.commit();
}

async function seedSettings() {
  console.log('  Seeding settings...');
  await setDoc(doc(db, 'users', DEMO_UID, 'settings', 'current'), {
    displayName: 'vault.deadagent.eth',
    avatarUrl: '',
    emailAlerts: true,
    browserPush: false,
    telegramWebhook: '',
    heartbeatDays: 7,
    emergencyContacts: [
      { label: 'Primary Heir', address: '0x1234567890123456789012345678901234567890' },
    ],
    updatedAt: new Date().toISOString(),
  });
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 DeadAgent Demo Data Seeder');
  console.log('━'.repeat(40));
  console.log(`  Target UID: ${DEMO_UID}`);
  console.log(`  Project:    ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}\n`);

  try {
    await seedAgents();
    await seedTestament();
    await seedEvents();
    await seedSettings();

    console.log('\n✅ Seed complete — 3 agents, 1 testament, 20 events, settings written.');
    console.log('   Visit /dashboard to see the demo data.\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    console.error('   Make sure your Firebase config in .env.local is valid.\n');
    process.exit(1);
  }

  process.exit(0);
}

main();
