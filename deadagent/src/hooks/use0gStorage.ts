import { useState } from 'react';
import { storeTestamentOn0G } from '@/lib/integrations/0g';
import { useWalletStore } from '@/lib/store/useWalletStore';

export function use0gStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address } = useWalletStore();

  const uploadTestament = async (testamentData: any) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsUploading(true);
    setError(null);
    setTxHash(null);

    try {
      // Stringify and "encrypt" the data for storage
      const payloadString = JSON.stringify(testamentData);
      const mockEncrypted = `0g_enc_${btoa(payloadString)}`;

      // Call the 0G integration to store data and get a Sepolia TX Hash
      const { txHash: hash } = await storeTestamentOn0G(mockEncrypted, address);
      
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('0G Storage Error:', err);
      setError(err.message || 'Failed to upload to 0G Storage');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadTestament,
    isUploading,
    error,
    txHash,
  };
}
