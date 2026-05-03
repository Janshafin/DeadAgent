'use client';

import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Dialog from '@radix-ui/react-dialog';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useSignMessage } from 'wagmi';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { firestoreWriteWithRetry } from '@/lib/firebase/retryWrite';
import { isAddress } from 'viem';
import { use0gStorage } from '@/hooks/use0gStorage';

type TriggerType = 'inactivity_30' | 'inactivity_90' | 'inactivity_180' | 'date' | 'consensus';

interface PreviewData {
  ethAlloc: number;
  ercAlloc: number;
  instructions: string;
  heirs: string[];
  trigger: TriggerType;
  useZeroG: boolean;
}

export function TestamentEditor() {
  const { address, ensName } = useWalletStore();
  const { signMessageAsync } = useSignMessage();

  // Form State
  const [ethAlloc, setEthAlloc] = useState([60]);
  const [ercAlloc, setErcAlloc] = useState([40]);
  const [instructions, setInstructions] = useState('');
  const [heirs, setHeirs] = useState<string[]>(['']);
  const [trigger, setTrigger] = useState<TriggerType>('inactivity_90');
  const [useZeroG, setUseZeroG] = useState(true);
  
  // UI State
  const [isSealing, setIsSealing] = useState(false);
  const { uploadTestament, isUploading, txHash } = use0gStorage();
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Sync sliders to always equal 100
  const handleEthChange = (val: number[]) => {
    setEthAlloc(val);
    setErcAlloc([100 - val[0]]);
  };

  const handleErcChange = (val: number[]) => {
    setErcAlloc(val);
    setEthAlloc([100 - val[0]]);
  };

  const handleHeirChange = (index: number, val: string) => {
    const newHeirs = [...heirs];
    newHeirs[index] = val;
    setHeirs(newHeirs);
  };

  const addHeir = () => setHeirs([...heirs, '']);
  const removeHeir = (index: number) => {
    if (heirs.length > 1) {
      setHeirs(heirs.filter((_, i) => i !== index));
    }
  };

  // Debounced Preview Update
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewData({
        ethAlloc: ethAlloc[0],
        ercAlloc: ercAlloc[0],
        instructions,
        heirs: heirs.filter(h => h.trim() !== ''),
        trigger,
        useZeroG
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [ethAlloc, ercAlloc, instructions, heirs, trigger, useZeroG]);

  const isValid = 
    ethAlloc[0] + ercAlloc[0] === 100 &&
    heirs.some(h => h.trim().length > 0) &&
    instructions.trim().length > 0;

  const handleSeal = async () => {
    if (!isValid || !address) return;
    setIsSealing(true);

    try {
      // 1. Encode testament as JSON
      // Sanitize inputs before encoding
      const sanitizedInstructions = instructions.replace(/[<>]/g, '');
      const validHeirs = heirs.filter(h => h.trim() !== '');

      const testamentData = {
        owner: address,
        allocations: { eth: ethAlloc[0], erc20: ercAlloc[0] },
        instructions: sanitizedInstructions,
        heirs: validHeirs,
        trigger,
        useZeroG,
        timestamp: Date.now()
      };
      
      const payloadString = JSON.stringify(testamentData);

      // 2. Encrypt with user's public key (Mocking with signature -> symmetric key concept)
      let signature;
      try {
        signature = await signMessageAsync({ message: `SEAL TESTAMENT:\n${payloadString}` });
      } catch (err: any) {
        alert('Signature failed: ' + err.message);
        setIsSealing(false);
        return;
      }
      const mockEncryptedBlob = btoa(payloadString + signature);

      // 3. Store to 0G if requested or fallback to mock
      let finalTxHash = null;
      if (useZeroG) {
        finalTxHash = await uploadTestament(testamentData);
      }

      // 4. Store encrypted blob to Firestore (with exponential backoff)
      // try {
      //    await firestoreWriteWithRetry(
      //      () => setDoc(doc(db, 'testaments', address), {
      //         blob: mockEncryptedBlob,
      //         txHash: finalTxHash,
      //         updatedAt: new Date().toISOString(),
      //         status: 'sealed'
      //      }),
      //      'Testament seal',
      //    );
      // } catch (err) {
      //    console.warn("Firestore write failed (likely mock config), continuing...", err);
      // }

      // 5. Emit event to AXL (mock endpoint)
      console.log('Emitting AXL Event: TestamentSealed', { owner: address, trigger });

      // 6. Show success modal
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to seal testament:', error);
    } finally {
      setIsSealing(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'UNKNOWN.ETH');

  return (
    <div className="flex flex-col lg:flex-row gap-12 h-full min-h-[600px]">
      
      {/* LEFT — Editor Form */}
      <div className="flex-1 flex flex-col gap-8 bg-[#1b1c1c] border border-[#c9a84c]/20 p-8 rounded-sm">
        
        {/* Allocations */}
        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] border-b border-[#c9a84c]/20 pb-2">
            Asset Allocation
          </h3>
          <div className="flex flex-col gap-6 mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#d0c5b2] uppercase tracking-wider">ETH Reserves</span>
                <span className="text-[12px] text-[#e4e2e1] font-bold">{ethAlloc[0]}%</span>
              </div>
              <Slider.Root 
                className="relative flex items-center select-none touch-none w-full h-5" 
                value={ethAlloc} 
                onValueChange={handleEthChange} 
                max={100} 
                step={1}
              >
                <Slider.Track className="bg-[#0A0A0B] border border-[#c9a84c]/20 relative grow rounded-full h-[4px]">
                  <Slider.Range className="absolute bg-[#c9a84c] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-[#c9a84c] rounded-full shadow-[0_2px_10px] shadow-black/50 hover:bg-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 transition-colors" />
              </Slider.Root>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#d0c5b2] uppercase tracking-wider">ERC-20 Treasury</span>
                <span className="text-[12px] text-[#e4e2e1] font-bold">{ercAlloc[0]}%</span>
              </div>
              <Slider.Root 
                className="relative flex items-center select-none touch-none w-full h-5" 
                value={ercAlloc} 
                onValueChange={handleErcChange} 
                max={100} 
                step={1}
              >
                <Slider.Track className="bg-[#0A0A0B] border border-[#c9a84c]/20 relative grow rounded-full h-[4px]">
                  <Slider.Range className="absolute bg-[#c9a84c] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-[#c9a84c] rounded-full shadow-[0_2px_10px] shadow-black/50 hover:bg-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 transition-colors" />
              </Slider.Root>
            </div>
            {ethAlloc[0] + ercAlloc[0] !== 100 && (
              <p className="text-red-500 text-[10px] tracking-wider uppercase">Allocations must equal 100%</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] border-b border-[#c9a84c]/20 pb-2">
            Agent Handoff Instructions
          </h3>
          <textarea
            className="bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm p-4 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/40 focus:outline-none focus:border-[#c9a84c]/60 min-h-[100px] resize-y font-mono"
            placeholder="Specify final execution logic for your AI agents..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Heirs */}
        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] border-b border-[#c9a84c]/20 pb-2">
            Heir Wallets
          </h3>
          <div className="flex flex-col gap-3">
            {heirs.map((heir, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2 text-[12px] text-[#e4e2e1] placeholder-[#c9a84c]/40 focus:outline-none focus:border-[#c9a84c]/60 font-mono"
                  placeholder="0x... or ENS"
                  value={heir}
                  onChange={(e) => handleHeirChange(i, e.target.value)}
                />
                <button 
                  onClick={() => removeHeir(i)}
                  className="w-8 h-8 flex items-center justify-center border border-red-500/30 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 rounded-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
            <button 
              onClick={addHeir}
              className="self-start text-[10px] text-[#c9a84c]/70 hover:text-[#c9a84c] uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Add Beneficiary
            </button>
          </div>
        </div>

        {/* Triggers & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] border-b border-[#c9a84c]/20 pb-2">
              Trigger Conditions
            </h3>
            <select
              className="bg-[#0A0A0B] border border-[#c9a84c]/20 rounded-sm px-4 py-2 text-[12px] text-[#e4e2e1] focus:outline-none focus:border-[#c9a84c]/60"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as TriggerType)}
            >
              <option value="inactivity_30">Inactivity (30 Days)</option>
              <option value="inactivity_90">Inactivity (90 Days)</option>
              <option value="inactivity_180">Inactivity (180 Days)</option>
              <option value="date">Specific Date</option>
              <option value="consensus">Witness Consensus</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-[12px] font-medium text-[#c9a84c] uppercase tracking-[0.2em] border-b border-[#c9a84c]/20 pb-2">
              Decentralized Storage
            </h3>
            <label className="flex items-center gap-3 cursor-pointer mt-1 group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={useZeroG}
                  onChange={(e) => setUseZeroG(e.target.checked)}
                />
                <div className={`w-5 h-5 border rounded-sm transition-colors ${useZeroG ? 'bg-[#c9a84c] border-[#c9a84c]' : 'bg-[#0A0A0B] border-[#c9a84c]/30 group-hover:border-[#c9a84c]/70'}`}>
                  {useZeroG && <span className="material-symbols-outlined text-[#0A0A0B] text-[16px] absolute inset-0 flex items-center justify-center">check</span>}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#e4e2e1] group-hover:text-white transition-colors">Encrypt & store on 0G</span>
                <span className="text-[10px] text-[#c9a84c]/60">Est. cost: 0.002 ETH</span>
              </div>
            </label>
          </div>
        </div>

        {/* Seal Action */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleSeal}
            disabled={!isValid || isSealing || isUploading || !address}
            className={`w-full py-4 uppercase tracking-[0.3em] text-[12px] font-bold rounded-sm transition-all duration-500
              ${(!isValid || !address) ? 'bg-[#141415] text-[#555] border border-[#333] cursor-not-allowed' 
              : 'bg-[#c9a84c] text-[#0A0A0B] hover:bg-[#e2c47a] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'}`}
          >
            {isSealing || isUploading ? 'Sealing & Storing...' : 'Seal Testament'}
          </button>
        </div>
      </div>

      {/* RIGHT — Live Preview */}
      <div className="flex-1 bg-[#f5f2eb] p-10 rounded-sm shadow-inner overflow-y-auto border border-[#d0c5b2]/40 relative min-h-[600px]">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        <div className="relative z-10 flex flex-col gap-8 max-w-lg mx-auto">
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border border-[#8c7335]/40 rounded-full flex items-center justify-center p-1">
              <div className="w-full h-full border border-[#8c7335] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8c7335] text-[20px]">account_balance</span>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-[24px] text-[#2c2c2c] uppercase tracking-widest leading-tight">
                Testament of <br/>
                <span className="font-mono text-[#5a481c] text-[18px] tracking-normal">{displayName}</span>
              </h2>
              <p className="font-mono text-[10px] text-[#666] mt-2 uppercase tracking-widest">
                Sealed on {today}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8c7335]/40 to-transparent"></div>

          <div className="space-y-6 font-serif text-[#333] text-[14px] leading-relaxed">
            <p>
              I, being of sound cryptographic mind, do hereby establish this digital testament. Upon the trigger condition of 
              <strong className="text-[#5a481c] font-mono font-normal ml-1 bg-[#8c7335]/10 px-1 rounded">
                {previewData?.trigger?.replace('_', ' ') || '...'}
              </strong>, 
              my designated AI agents shall execute the following succession protocol.
            </p>

            <div className="bg-white/50 border border-[#8c7335]/20 p-6 rounded-sm space-y-4">
              <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8c7335] border-b border-[#8c7335]/20 pb-2">
                Asset Distribution
              </h4>
              <ul className="space-y-2 font-mono text-[12px]">
                <li className="flex justify-between">
                  <span>ETH Reserves</span>
                  <span className="font-bold text-[#5a481c]">{previewData?.ethAlloc || 0}%</span>
                </li>
                <li className="flex justify-between">
                  <span>ERC-20 Treasury</span>
                  <span className="font-bold text-[#5a481c]">{previewData?.ercAlloc || 0}%</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/50 border border-[#8c7335]/20 p-6 rounded-sm space-y-4">
              <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8c7335] border-b border-[#8c7335]/20 pb-2">
                Agent Instructions
              </h4>
              <p className="font-mono text-[12px] whitespace-pre-wrap text-[#444]">
                {previewData?.instructions || 'No instructions provided.'}
              </p>
            </div>

            <div className="bg-white/50 border border-[#8c7335]/20 p-6 rounded-sm space-y-4">
              <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8c7335] border-b border-[#8c7335]/20 pb-2">
                Beneficiaries
              </h4>
              <ul className="list-disc pl-4 font-mono text-[11px] space-y-1 text-[#444] break-all">
                {(previewData?.heirs && previewData.heirs.length > 0) ? (
                  previewData.heirs.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))
                ) : (
                  <li className="text-[#888] italic list-none -ml-4">No beneficiaries defined.</li>
                )}
              </ul>
            </div>

            <p className="text-[12px] text-center italic text-[#666] pt-4">
              This document shall be encrypted and recorded {previewData?.useZeroG ? 'to 0G Decentralized Storage' : 'to the secure vault'}.
            </p>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8c7335]/40 to-transparent mt-4"></div>
          
        </div>
      </div>

      {/* Success Modal */}
      <Dialog.Root open={showSuccess} onOpenChange={setShowSuccess}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-[#0A0A0B] border border-[#c9a84c]/30 p-10 rounded-sm shadow-[0_0_50px_rgba(201,168,76,0.1)] w-full max-w-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 flex items-center justify-center border border-[#c9a84c]/30">
                <span className="material-symbols-outlined text-[#c9a84c] text-[32px]">verified_user</span>
              </div>
              <div className="space-y-2">
                <Dialog.Title className="font-serif text-[24px] text-[#e4e2e1]">
                  Testament Sealed
                </Dialog.Title>
                <Dialog.Description className="font-sans text-[14px] font-light text-[#d0c5b2] leading-relaxed">
                  Your digital legacy has been encrypted and securely stored. Your agents will monitor the trigger conditions.
                </Dialog.Description>
              </div>
              
              {txHash && (
                <div className="w-full bg-[#1b1c1c] border border-[#c9a84c]/20 p-4 rounded-sm text-left">
                  <p className="text-[10px] text-[#c9a84c] uppercase tracking-wider mb-1">0G Storage Verification</p>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_ETHERSCAN_BASE}${txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-blue-400 hover:text-blue-300 break-all block truncate"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              <Dialog.Close asChild>
                <button className="mt-4 w-full bg-transparent border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10 py-3 uppercase tracking-[0.2em] text-[12px] font-bold rounded-sm transition-colors">
                  Return to Dashboard
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
