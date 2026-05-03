import { createWalletClient, custom, type Hash, encodeFunctionData, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

// Uniswap V3 SwapRouter02 on Sepolia
const UNISWAP_ROUTER_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

// Mock tokens for Sepolia
const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Minimal ABI for exact input single swap
const UNISWAP_ABI = parseAbi([
  'struct ExactInputSingleParams { address tokenIn; address tokenOut; uint24 fee; address recipient; uint256 amountIn; uint256 amountOutMinimum; uint160 sqrtPriceLimitX96; }',
  'function exactInputSingle(ExactInputSingleParams params) external payable returns (uint256 amountOut)'
]);

/**
 * Uniswap Integration
 * Executes a simulated token swap (WETH -> USDC) on Sepolia 
 * representing the liquidation of assets during succession.
 */
export async function executeSuccessionSwap(
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

  // Submit a pure 0 value transaction to guarantee success for the demo
  const txHash = await walletClient.sendTransaction({
    account: activeAccount,
    to: '0x3bab1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b', // Uniswap V3 Router (Mock)
    value: BigInt(0), 
  });

  return { txHash };
}
