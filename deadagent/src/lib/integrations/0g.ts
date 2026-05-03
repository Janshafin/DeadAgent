import { createWalletClient, custom, type Hash, stringToHex } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * 0G Storage Integration
 * For the hackathon demo, we simulate 0G Storage decentralised upload
 * by submitting the encrypted testament hash as calldata on the Sepolia testnet.
 * This provides a verifiable Etherscan transaction hash.
 */
export async function storeTestamentOn0G(
  encryptedData: string,
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
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (e) {
    console.error(e);
  }
  const [activeAccount] = await walletClient.getAddresses();
  if (!activeAccount) throw new Error("Could not find active account");

  // Convert the testament data to hex for the transaction data field
  const dataHex = stringToHex(encryptedData);

  // Submit a 0-value self-transaction on Sepolia with the data payload
  const txHash = await walletClient.sendTransaction({
    account: activeAccount,
    to: activeAccount, // Send to self
    value: BigInt(0),
    data: dataHex,
  });

  return { txHash };
}
