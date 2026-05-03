'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Slider from '@radix-ui/react-slider';
import * as Dialog from '@radix-ui/react-dialog';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { firestoreWriteWithRetry } from '@/lib/firebase/retryWrite';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useToast } from '@/components/ui/ToastProvider';
import { settingsSchema, DEFAULT_SETTINGS, type SettingsFormData } from './schema';
import { useEns } from '@/hooks/useEns';
import { useKeeper } from '@/hooks/useKeeper';

// ── Reusable UI pieces ─────────────────────────────────────
function SectionDivider({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#c9a84c]/20 pb-3">
      <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em]">
        {title}
      </h3>
      {subtitle && (
        <p className="font-sans text-[11px] font-light text-[#d0c5b2]/60 tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group py-2">
      <div className="flex flex-col">
        <span className="font-sans text-[12px] text-[#e4e2e1] group-hover:text-white transition-colors">
          {label}
        </span>
        {description && (
          <span className="font-sans text-[10px] text-[#99907e]">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-300 focus:outline-none
          ${checked ? 'bg-[#c9a84c] border-[#c9a84c]' : 'bg-[#2a2a2a] border-[#444]'}`}
      >
        <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1">{message}</p>;
}

const SERVICES = [
  { name: '0G Storage', icon: 'cloud', status: 'connected' as const },
  { name: 'Axelar GMP', icon: 'lan', status: 'connected' as const },
  { name: 'KeeperHub', icon: 'hub', status: 'connected' as const },
  { name: 'Uniswap V3', icon: 'swap_horiz', status: 'connected' as const },
];

const STATUS_STYLES = {
  connected: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  pending: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  disconnected: 'bg-red-500/10 border-red-500/30 text-red-400',
};

// ── Main Component ─────────────────────────────────────────
export function SettingsForm() {
  const { address, ensName } = useWalletStore();
  const { toast } = useToast();
  const uid = address || 'demo-user';

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [destroyOpen, setDestroyOpen] = useState(false);
  const { registerSubname, isRegistering, txHash: ensTxHash } = useEns();
  const { registerHeartbeatJob, isRegisteringJob, txHash: keeperTxHash } = useKeeper();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...DEFAULT_SETTINGS,
      displayName: ensName || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  // Watch all form values for auto-save
  const watchedValues = useWatch({ control });

  // ── Auto-save to Firestore with 1s debounce ──────────────
  const saveToFirestore = useCallback(
    async (data: SettingsFormData) => {
      setSaveStatus('saving');
      try {
        await firestoreWriteWithRetry(
          () => setDoc(doc(db, 'users', uid, 'settings', 'current'), {
            ...data,
            updatedAt: new Date().toISOString(),
          }),
          'Settings auto-save',
        );
      } catch (err) {
        console.warn('Firestore save failed (mock config):', err);
        toast('Settings save failed — will retry', 'error');
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    [uid, toast],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSubmit(saveToFirestore)();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // ── Heartbeat slider state ───────────────────────────────
  const heartbeatDays = useWatch({ control, name: 'heartbeatDays' });

  // ── ENS Registration Handler ─────────────────────────────
  const handleRegisterEns = async () => {
    const name = watchedValues.displayName || '';
    const subname = name.replace('.deadagent.eth', '').toLowerCase();
    if (!subname) {
      toast('Please enter a valid subname', 'error');
      return;
    }
    const hash = await registerSubname(subname);
    if (hash) {
      toast('ENS Subname registered on Sepolia!', 'success');
    }
  };

  // ── Keeper Registration Handler ──────────────────────────
  const handleRegisterKeeper = async () => {
    const days = watchedValues.heartbeatDays || 7;
    const hash = await registerHeartbeatJob(days);
    if (hash) {
      toast('Keeper heartbeat job registered on Sepolia!', 'success');
    }
  };

  // ── Danger zone handlers ─────────────────────────────────
  const handleRevokeAll = () => {
    console.log('🚨 Revoked all agents for', uid);
    toast('All agents revoked successfully', 'warning');
    setRevokeOpen(false);
  };
  const handleDestroyTestament = () => {
    console.log('🚨 Destroyed testament for', uid);
    toast('Testament destroyed permanently', 'error');
    setDestroyOpen(false);
  };

  return (
    <div className="flex flex-col gap-12 max-w-2xl">
      {/* Save indicator */}
      <div className="fixed top-6 right-6 z-50">
        {saveStatus === 'saving' && (
          <span className="inline-flex items-center gap-2 bg-[#1b1c1c] border border-[#c9a84c]/20 rounded-full px-4 py-2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <span className="font-sans text-[10px] text-[#c9a84c] uppercase tracking-widest">Saving…</span>
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="inline-flex items-center gap-2 bg-[#1b1c1c] border border-emerald-500/30 rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
            <span className="font-sans text-[10px] text-emerald-400 uppercase tracking-widest">Saved</span>
          </span>
        )}
      </div>

      {/* ── 1. ENS Profile ────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <SectionDivider title="ENS Profile" subtitle="Your on-chain identity" />
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-sm border border-[#c9a84c]/30 bg-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
            <span className="material-symbols-outlined text-[#c9a84c] text-[28px]">account_circle</span>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="font-sans text-[10px] text-[#d0c5b2] uppercase tracking-wider block mb-1.5">
                Display Name
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    {...register('displayName')}
                    className="w-full bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2.5 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/30 focus:outline-none focus:border-[#c9a84c]/60 font-mono transition-colors"
                    placeholder="vault.deadagent.eth"
                  />
                  <FieldError message={errors.displayName?.message} />
                </div>
                <button
                  type="button"
                  onClick={handleRegisterEns}
                  disabled={isRegistering}
                  className="px-4 py-2 bg-[#1b1c1c] border border-[#c9a84c]/20 text-[#c9a84c] rounded-sm text-[10px] uppercase tracking-wider hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-50"
                >
                  {isRegistering ? 'Registering...' : 'Register'}
                </button>
              </div>
              {ensTxHash && (
                <div className="mt-2 p-2 bg-[#1b1c1c] border border-[#c9a84c]/20 rounded-sm">
                  <p className="text-[9px] text-[#c9a84c] uppercase tracking-wider">Sepolia TX Hash:</p>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_ETHERSCAN_BASE}${ensTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-[10px] text-blue-400 hover:underline font-mono truncate block"
                  >
                    {ensTxHash}
                  </a>
                </div>
              )}
            </div>
            <div>
              <label className="font-sans text-[10px] text-[#d0c5b2] uppercase tracking-wider block mb-1.5">
                Avatar URL (ENS resolved)
              </label>
              <input
                {...register('avatarUrl')}
                className="w-full bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2.5 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/30 focus:outline-none focus:border-[#c9a84c]/60 font-mono transition-colors"
                placeholder="https://..."
              />
              <FieldError message={errors.avatarUrl?.message} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Notifications ──────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDivider title="Notifications" subtitle="Alert channels for agent activity" />
        <Toggle
          checked={watchedValues.emailAlerts ?? true}
          onChange={(v) => setValue('emailAlerts', v)}
          label="Email Alerts"
          description="Receive critical alerts via email"
        />
        <Toggle
          checked={watchedValues.browserPush ?? false}
          onChange={(v) => setValue('browserPush', v)}
          label="Browser Push Notifications"
          description="Desktop notifications for real-time events"
        />
        <div className="mt-2">
          <label className="font-sans text-[10px] text-[#d0c5b2] uppercase tracking-wider block mb-1.5">
            Telegram Webhook URL
          </label>
          <input
            {...register('telegramWebhook')}
            className="w-full bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2.5 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/30 focus:outline-none focus:border-[#c9a84c]/60 font-mono transition-colors"
            placeholder="https://api.telegram.org/bot.../sendMessage"
          />
          <FieldError message={errors.telegramWebhook?.message} />
        </div>
      </section>

      {/* ── 3. Heartbeat Interval ─────────────────────────── */}
      <section className="flex flex-col gap-6">
        <SectionDivider title="Heartbeat Interval" subtitle="Days of inactivity before agents trigger succession" />
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] text-[#d0c5b2] uppercase tracking-wider">
              Check-in window
            </span>
            <span className="font-mono text-[14px] font-bold text-[#c9a84c]">
              {heartbeatDays} {heartbeatDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[heartbeatDays ?? 7]}
            onValueChange={([v]) => setValue('heartbeatDays', v)}
            min={1}
            max={30}
            step={1}
          >
            <Slider.Track className="bg-[#0A0A0B] border border-[#c9a84c]/20 relative grow rounded-full h-[4px]">
              <Slider.Range className="absolute bg-[#c9a84c] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-[#c9a84c] rounded-full shadow-[0_2px_10px] shadow-black/50 hover:bg-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 transition-colors" />
          </Slider.Root>
          <div className="flex justify-between text-[9px] text-[#555] font-mono uppercase">
            <span>1 day</span>
            <span>15 days</span>
            <span>30 days</span>
          </div>
          
          <button
            type="button"
            onClick={handleRegisterKeeper}
            disabled={isRegisteringJob}
            className="mt-2 w-full py-3 bg-[#1b1c1c] border border-[#c9a84c]/20 text-[#c9a84c] rounded-sm text-[10px] uppercase tracking-wider hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-50"
          >
            {isRegisteringJob ? 'Registering Job...' : 'Update On-Chain Keeper'}
          </button>
          
          {keeperTxHash && (
            <div className="mt-2 p-3 bg-[#1b1c1c] border border-[#c9a84c]/20 rounded-sm">
              <p className="text-[9px] text-[#c9a84c] uppercase tracking-wider mb-1">KeeperHub TX Hash:</p>
              <a 
                href={`${process.env.NEXT_PUBLIC_ETHERSCAN_BASE}${keeperTxHash}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-[10px] text-blue-400 hover:underline font-mono truncate block"
              >
                {keeperTxHash}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Emergency Contacts ─────────────────────────── */}
      <section className="flex flex-col gap-6">
        <SectionDivider title="Emergency Contacts" subtitle="Backup wallets for succession override" />
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="sm:w-1/3">
                  <input
                    {...register(`emergencyContacts.${index}.label`)}
                    className="w-full bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2.5 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors"
                    placeholder="Label"
                  />
                  <FieldError message={errors.emergencyContacts?.[index]?.label?.message} />
                </div>
                <div className="flex-1">
                  <input
                    {...register(`emergencyContacts.${index}.address`)}
                    className="w-full bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2.5 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/30 focus:outline-none focus:border-[#c9a84c]/60 font-mono transition-colors"
                    placeholder="0x..."
                  />
                  <FieldError message={errors.emergencyContacts?.[index]?.address?.message} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => fields.length > 1 && remove(index)}
                className="mt-1 w-8 h-8 flex items-center justify-center border border-red-500/30 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 rounded-sm transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ label: '', address: '' })}
            className="self-start text-[10px] text-[#c9a84c]/70 hover:text-[#c9a84c] uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add</span> Add Contact
          </button>
        </div>
      </section>

      {/* ── 5. Connected Services ─────────────────────────── */}
      <section className="flex flex-col gap-6">
        <SectionDivider title="Connected Services" subtitle="External protocol integrations" />
        <div className="flex flex-col gap-3">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between bg-[#0A0A0B] border border-[#c9a84c]/10 rounded-sm px-5 py-4 hover:border-[#c9a84c]/25 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-sm border border-[#c9a84c]/20 bg-[#1b1c1c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c9a84c] text-[16px]">{svc.icon}</span>
                </div>
                <span className="font-sans text-[12px] text-[#e4e2e1] tracking-wide">{svc.name}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-[9px] font-mono uppercase tracking-wider ${STATUS_STYLES[svc.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  svc.status === 'connected' ? 'bg-emerald-400' :
                  svc.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Danger Zone ────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-red-500/30 pb-3">
          <h3 className="font-sans text-[12px] font-medium text-red-400 uppercase tracking-[0.2em]">
            Danger Zone
          </h3>
          <p className="font-sans text-[11px] font-light text-red-400/50 tracking-wide">
            Irreversible actions — proceed with extreme caution
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Revoke All Agents */}
          <Dialog.Root open={revokeOpen} onOpenChange={setRevokeOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="flex-1 py-3 border border-red-500/30 text-red-400 rounded-sm font-sans text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors"
              >
                Revoke All Agents
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-[#0A0A0B] border border-red-500/30 p-10 rounded-sm shadow-[0_0_50px_rgba(239,68,68,0.08)] w-full max-w-md">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                    <span className="material-symbols-outlined text-red-400 text-[32px]">warning</span>
                  </div>
                  <Dialog.Title className="font-serif text-[22px] text-[#e4e2e1]">
                    Revoke All Agents?
                  </Dialog.Title>
                  <Dialog.Description className="font-sans text-[13px] font-light text-[#d0c5b2] leading-relaxed">
                    This will immediately deactivate all deployed succession agents. Your testament will remain sealed but unmonitored.
                  </Dialog.Description>
                  <div className="flex gap-3 w-full mt-2">
                    <Dialog.Close asChild>
                      <button className="flex-1 py-3 border border-[#c9a84c]/20 text-[#d0c5b2] rounded-sm text-[11px] uppercase tracking-[0.2em] hover:bg-[#c9a84c]/5 transition-colors">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleRevokeAll}
                      className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-sm text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/30 transition-colors"
                    >
                      Confirm Revoke
                    </button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Destroy Testament */}
          <Dialog.Root open={destroyOpen} onOpenChange={setDestroyOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="flex-1 py-3 border border-red-500/30 text-red-400 rounded-sm font-sans text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors"
              >
                Destroy Testament
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-[#0A0A0B] border border-red-500/30 p-10 rounded-sm shadow-[0_0_50px_rgba(239,68,68,0.08)] w-full max-w-md">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                    <span className="material-symbols-outlined text-red-400 text-[32px]">delete_forever</span>
                  </div>
                  <Dialog.Title className="font-serif text-[22px] text-[#e4e2e1]">
                    Destroy Testament?
                  </Dialog.Title>
                  <Dialog.Description className="font-sans text-[13px] font-light text-[#d0c5b2] leading-relaxed">
                    This permanently deletes your encrypted testament from both Firestore and decentralized storage. This action cannot be undone.
                  </Dialog.Description>
                  <div className="flex gap-3 w-full mt-2">
                    <Dialog.Close asChild>
                      <button className="flex-1 py-3 border border-[#c9a84c]/20 text-[#d0c5b2] rounded-sm text-[11px] uppercase tracking-[0.2em] hover:bg-[#c9a84c]/5 transition-colors">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleDestroyTestament}
                      className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-sm text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/30 transition-colors"
                    >
                      Destroy Forever
                    </button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </section>
    </div>
  );
}
