import { useState } from 'react';
import { registerEnsSubname } from '@/lib/integrations/ens';
import { useWalletStore } from '@/lib/store/useWalletStore';

export function useEns() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address, setWalletInfo } = useWalletStore();

  const registerSubname = async (subname: string) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsRegistering(true);
    setError(null);
    setTxHash(null);

    try {
      // Execute the Sepolia transaction
      const { txHash: hash } = await registerEnsSubname(subname, address);
      
      setTxHash(hash);
      
      // Optimistically update the local wallet store ENS name
      setWalletInfo({ ensName: `${subname}.deadagent.eth` });

      return hash;
    } catch (err: any) {
      console.error('ENS Registration Error:', err);
      setError(err.message || 'Failed to register ENS subname');
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerSubname,
    isRegistering,
    error,
    txHash,
  };
}
