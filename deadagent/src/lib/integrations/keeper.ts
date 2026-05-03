import { createWalletClient, custom, type Hash, encodeFunctionData, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

// Mock address for the KeeperHub contract on Sepolia
const KEEPERHUB_ADDRESS = '0x1234567890123456789012345678901234567890';

// Minimal ABI for registering a heartbeat job
const KEEPER_ABI = parseAbi([
  'function registerHeartbeatJob(address owner, uint256 intervalDays) external',
]);

/**
 * KeeperHub Integration
 * Registers a heartbeat monitoring job on the Sepolia testnet.
 */
export async function registerKeeperJob(
  intervalDays: number,
  userAddress: string
): Promise<{ txHash: Hash }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No crypto wallet found. Please install MetaMask.');
  }

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum)
  });

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const [activeAccount] = await walletClient.getAddresses();

  const dataHex = encodeFunctionData({
    abi: KEEPER_ABI,
    functionName: 'registerHeartbeatJob',
    args: [activeAccount, BigInt(intervalDays)],
  });

  // Submit the transaction to KeeperHub on Sepolia
  const txHash = await walletClient.sendTransaction({
    account: activeAccount,
    to: KEEPERHUB_ADDRESS,
    value: BigInt(0), 
    data: dataHex,
  });

  return { txHash };
}
