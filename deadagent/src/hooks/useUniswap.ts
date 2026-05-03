import { useState } from 'react';
import { executeSuccessionSwap } from '@/lib/integrations/uniswap';
import { useWalletStore } from '@/lib/store/useWalletStore';

export function useUniswap() {
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address } = useWalletStore();

  const simulateSuccessionSwap = async () => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsSwapping(true);
    setError(null);
    setTxHash(null);

    try {
      // Execute the Sepolia transaction
      const { txHash: hash } = await executeSuccessionSwap(address);
      
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('Uniswap Swap Error:', err);
      setError(err.message || 'Failed to execute Uniswap swap');
      return null;
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    simulateSuccessionSwap,
    isSwapping,
    error,
    txHash,
  };
}
