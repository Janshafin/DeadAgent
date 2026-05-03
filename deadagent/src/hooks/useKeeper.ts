import { useState } from 'react';
import { registerKeeperJob } from '@/lib/integrations/keeper';
import { useWalletStore } from '@/lib/store/useWalletStore';

export function useKeeper() {
  const [isRegisteringJob, setIsRegisteringJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address } = useWalletStore();

  const registerHeartbeatJob = async (intervalDays: number) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsRegisteringJob(true);
    setError(null);
    setTxHash(null);

    try {
      // Execute the Sepolia transaction
      const { txHash: hash } = await registerKeeperJob(intervalDays, address);
      
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('KeeperHub Registration Error:', err);
      setError(err.message || 'Failed to register Keeper job');
      return null;
    } finally {
      setIsRegisteringJob(false);
    }
  };

  return {
    registerHeartbeatJob,
    isRegisteringJob,
    error,
    txHash,
  };
}
