'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConnect, useAccount, useDisconnect, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { useWalletStore } from '@/lib/store/useWalletStore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const router = useRouter();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, chainId } = useAccount();
  
  // ENS resolution must target mainnet regardless of connected chain
  const { data: ensName } = useEnsName({ 
    address,
    chainId: mainnet.id,
  });
  
  const { setWalletInfo, clearWallet } = useWalletStore();

  useEffect(() => {
    if (isConnected && address) {
      // Update global store immediately on connection
      setWalletInfo({
        address,
        ensName: ensName || null,
        isConnected,
        chainId,
      });

      // Auto-redirect to dashboard after brief delay
      const redirectTimer = setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 1500);

      // Firebase auth - gracefully handle if not configured
      import('@/lib/firebase/config').then(async ({ auth, db }) => {
        try {
          const { signInAnonymously } = await import('firebase/auth');
          const { doc, setDoc } = await import('firebase/firestore');
          const userCredential = await signInAnonymously(auth);
          await setDoc(doc(db, 'users', address.toLowerCase()), {
            firebaseUid: userCredential.user.uid,
            address: address.toLowerCase(),
            ensName: ensName || null,
            createdAt: new Date(),
          }, { merge: true });
        } catch (err) {
          // Firebase not configured yet — that's fine for dev
          console.warn('Firebase auth skipped (not configured):', err);
        }
      });

      return () => clearTimeout(redirectTimer);
    } else {
      clearWallet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, ensName, chainId, setWalletInfo, clearWallet]);

  if (!isOpen) return null;

  // Display name: ENS → truncated address
  const displayName = ensName 
    ? ensName 
    : address 
      ? `${address.slice(0, 6)}...${address.slice(-4)}` 
      : '';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Luxury Modal Container */}
      <section 
        className="w-full max-w-[500px] bg-[#0e0e0e] border border-[#c9a84c]/20 p-12 flex flex-col gap-12 relative shadow-2xl shadow-black z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#c9a84c]/50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#c9a84c]/50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#c9a84c]/50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#c9a84c]/50"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors">
          ✕
        </button>

        {/* Header */}
        <header className="flex flex-col items-center text-center gap-6">
          <div className="font-sans text-[14px] font-semibold text-[#c9a84c] uppercase tracking-[0.3em]">
            Deadagent Protocol
          </div>
          <h1 className="font-serif text-[32px] font-normal text-[#e4e2e1]">
            Initialize Vault Connection
          </h1>
          <p className="font-sans text-[16px] font-light text-[#d0c5b2] max-w-sm">
            Authenticate your identity to access secured heritage assets and cryptographic testaments.
          </p>
        </header>

        {/* Auth Options or Connected State */}
        {!isConnected ? (
          <div className="flex flex-col gap-4">
            {connectors
              .filter((connector, index, self) => 
                self.findIndex(c => c.name === connector.name) === index
              )
              .map((connector) => (
              <button 
                key={connector.uid}
                onClick={() => connectAsync({ connector }).catch(console.error)}
                className="group w-full flex items-center justify-between p-5 bg-transparent border border-[#c9a84c]/30 hover:bg-[#c9a84c] transition-all duration-500 ease-out cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <span className="font-sans text-[12px] font-medium text-[#c9a84c] group-hover:text-[#3d2e00] uppercase tracking-[0.2em] transition-colors duration-500">
                    {connector.name}
                  </span>
                </div>
                <span className="text-[#c9a84c]/50 group-hover:text-[#3d2e00] relative z-10 transition-colors duration-500">
                  ›
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <span className="font-sans text-[12px] font-medium text-[#d0c5b2] opacity-50 uppercase tracking-[0.2em] text-center">
                Active Session Detected
            </span>
            <div className="w-full flex items-center justify-between p-4 bg-[#1b1c1c] border border-[#c9a84c]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-[#c9a84c]/30 rounded-sm bg-[#131313]">
                  <span className="text-[18px] text-[#c9a84c]">✓</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em] opacity-70">
                      Connected as
                  </span>
                  <span className="font-sans text-[14px] font-semibold text-[#c9a84c] tracking-[0.15em]">
                      {displayName}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => disconnect()}
                className="font-sans text-[10px] font-medium text-[#c9a84c] border-b border-[#c9a84c]/30 pb-1 hover:border-[#c9a84c] transition-colors uppercase tracking-[0.2em]">
                Disconnect
              </button>
            </div>

            {/* ── Primary CTA: Enter Dashboard ────────────── */}
            <button
              onClick={() => { onClose(); router.push('/dashboard'); }}
              className="w-full bg-[#c9a84c] border border-[#c9a84c] text-[#1a1400] font-sans text-[12px] font-bold uppercase tracking-[0.25em] py-4 px-8 rounded-sm hover:bg-[#e2c47a] hover:border-[#e2c47a] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>Enter Vault</span>
              <span className="text-[16px]">→</span>
            </button>
            <p className="text-center font-sans text-[10px] text-[#d0c5b2]/40 uppercase tracking-[0.2em]">
              Redirecting automatically…
            </p>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 opacity-60">
          <span className="text-[16px] text-[#c9a84c]">🛡</span>
          <span className="font-sans text-[12px] font-medium text-[#d0c5b2] uppercase tracking-[0.2em]">
              Protected by AXL Encryption
          </span>
        </div>

        {/* Chain indicator */}
        {isConnected && chainId && (
          <div className="text-center">
            <span className="font-sans text-[10px] font-medium text-[#d0c5b2]/40 uppercase tracking-[0.2em]">
              Chain ID: {chainId} · {chainId === 11155111 ? 'Sepolia Testnet' : chainId === 1 ? 'Ethereum Mainnet' : `Network ${chainId}`}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
