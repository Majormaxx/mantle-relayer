import { Contract, InterfaceAbi, ContractRunner } from 'ethers';
import { getProvider } from './provider.js';
import { getRelayerSigner } from './wallet.js';
import { contracts as contractAddresses } from '../../config/index.js';
import { logger } from '../../monitoring/logger.js';

// Import ABIs
import PaymasterABI from '../../../abis/Paymaster.json' with { type: 'json' };
import RelayerHubABI from '../../../abis/RelayerHub.json' with { type: 'json' };
import PaymasterFactoryABI from '../../../abis/PaymasterFactory.json' with { type: 'json' };

/**
 * Contract instances cache.
 */
const contractCache = new Map<string, Contract>();

/**
 * Get or create a contract instance.
 */
function getOrCreateContract(
  address: string,
  abi: InterfaceAbi,
  useSigner: boolean = false
): Contract {
  const cacheKey = `${address}-${useSigner}`;
  
  let contract = contractCache.get(cacheKey);
  if (!contract) {
    const provider = getProvider();
    const signerOrProvider: ContractRunner = useSigner ? getRelayerSigner() : provider;
    contract = new Contract(address, abi, signerOrProvider);
    contractCache.set(cacheKey, contract);
    
    logger.debug({ address, useSigner }, 'Contract instance created');
  }
  
  return contract;
}

/**
 * Get RelayerHub contract instance.
 */
export function getRelayerHubContract(useSigner: boolean = false): Contract {
  return getOrCreateContract(
    contractAddresses.relayerHub,
    RelayerHubABI as InterfaceAbi,
    useSigner
  );
}

/**
 * Get PaymasterFactory contract instance.
 */
export function getPaymasterFactoryContract(useSigner: boolean = false): Contract {
  return getOrCreateContract(
    contractAddresses.paymasterFactory,
    PaymasterFactoryABI as InterfaceAbi,
    useSigner
  );
}

/**
 * Get a Paymaster contract instance by address.
 */
export function getPaymasterContract(address: string, useSigner: boolean = false): Contract {
  return getOrCreateContract(address, PaymasterABI as InterfaceAbi, useSigner);
}

/**
 * Clear contract cache (useful for testing).
 */
export function clearContractCache(): void {
  contractCache.clear();
}

/**
 * Helper to safely call a contract method.
 * Handles the dynamic nature of ethers Contract type.
 */
export async function callContractMethod<T>(
  contract: Contract,
  method: string,
  ...args: unknown[]
): Promise<T> {
  const fn = contract.getFunction(method);
  return await fn(...args) as T;
}

/**
 * Helper to safely call a contract view method with static call.
 */
export async function callContractView<T>(
  contract: Contract,
  method: string,
  ...args: unknown[]
): Promise<T> {
  const fn = contract.getFunction(method);
  return await fn.staticCall(...args) as T;
}

// Re-export Contract type for consumers
export type { Contract };
