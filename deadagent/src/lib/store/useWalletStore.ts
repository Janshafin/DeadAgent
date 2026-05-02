import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  ensName: string | null;
  isConnected: boolean;
  chainId: number | null;
  setWalletInfo: (info: Partial<WalletState>) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      ensName: null,
      isConnected: false,
      chainId: null,
      setWalletInfo: (info) => set((state) => ({ ...state, ...info })),
      clearWallet: () => set({ address: null, ensName: null, isConnected: false, chainId: null }),
    }),
    {
      name: 'deadagent-wallet-storage',
    }
  )
);
