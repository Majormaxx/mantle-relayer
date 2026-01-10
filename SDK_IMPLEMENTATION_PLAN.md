# SDK Implementation Plan - Mantle Gas-Less SDK

## Overview
A TypeScript SDK that abstracts the complexity of gasless transactions for frontend developers.

---

## Package Structure

```
mantle-gasless-sdk/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Main exports
│   ├── MantleGaslessSDK.ts         # Main SDK class
│   ├── clients/
│   │   ├── PaymasterClient.ts      # Paymaster contract interactions
│   │   ├── RelayerClient.ts        # Backend API client
│   │   └── FactoryClient.ts        # Factory contract interactions
│   ├── signer/
│   │   ├── EIP712Signer.ts         # EIP-712 signature generation
│   │   └── types.ts                # Signature types
│   ├── utils/
│   │   ├── encoding.ts             # Contract call encoding
│   │   ├── validation.ts           # Input validation
│   │   └── errors.ts               # Error classes
│   └── types/
│       ├── contracts.ts            # Contract types
│       └── api.ts                  # API response types
├── examples/
│   ├── basic-usage.ts
│   ├── paymaster-management.ts
│   └── advanced-usage.ts
└── test/
    └── integration.test.ts
```

---

## Core Classes

### 1. MantleGaslessSDK (Main Entry Point)

```typescript
import { ethers } from 'ethers';
import { PaymasterClient } from './clients/PaymasterClient';
import { RelayerClient } from './clients/RelayerClient';
import { FactoryClient } from './clients/FactoryClient';

export class MantleGaslessSDK {
  private provider: ethers.Provider;
  private relayerUrl: string;
  public factory: FactoryClient;
  private relayerClient: RelayerClient;

  constructor(
    provider: ethers.Provider,
    relayerUrl: string,
    factoryAddress: string
  ) {
    this.provider = provider;
    this.relayerUrl = relayerUrl;
    this.factory = new FactoryClient(provider, factoryAddress);
    this.relayerClient = new RelayerClient(relayerUrl);
  }

  /**
   * Get a Paymaster client for a specific Paymaster address.
   */
  getPaymaster(paymasterAddress: string, signer?: ethers.Signer): PaymasterClient {
    return new PaymasterClient(
      this.provider,
      paymasterAddress,
      this.relayerUrl,
      signer
    );
  }

  /**
   * Create a new Paymaster for a developer.
   */
  async createPaymaster(signer: ethers.Signer): Promise<PaymasterClient> {
    const paymasterAddress = await this.factory.createPaymaster(signer);
    return this.getPaymaster(paymasterAddress, signer);
  }

  /**
   * Check if backend relayer is healthy.
   */
  async isRelayerHealthy(): Promise<boolean> {
    return this.relayerClient.health();
  }
}
```

### 2. PaymasterClient (Developer Interface)

```typescript
import { ethers } from 'ethers';
import { EIP712Signer } from '../signer/EIP712Signer';
import { RelayerClient } from './RelayerClient';

export class PaymasterClient {
  private provider: ethers.Provider;
  private address: string;
  private relayerUrl: string;
  private signer?: ethers.Signer;
  private contract: ethers.Contract;
  private eip712Signer: EIP712Signer;
  private relayerClient: RelayerClient;

  constructor(
    provider: ethers.Provider,
    address: string,
    relayerUrl: string,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.address = address;
    this.relayerUrl = relayerUrl;
    this.signer = signer;
    this.contract = new ethers.Contract(address, PAYMASTER_ABI, provider);
    this.eip712Signer = new EIP712Signer(provider, address);
    this.relayerClient = new RelayerClient(relayerUrl);
  }

  // ========================================
  // DEVELOPER FUNCTIONS (require signer)
  // ========================================

  /**
   * Deposit MNT into the Paymaster.
   */
  async deposit(amount: bigint): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required for deposit');
    const tx = await this.signer.sendTransaction({
      to: this.address,
      value: amount
    });
    return tx.wait();
  }

  /**
   * Withdraw MNT from the Paymaster.
   */
  async withdraw(amount: bigint): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required for withdraw');
    const contract = this.contract.connect(this.signer);
    const tx = await contract.withdraw(amount);
    return tx.wait();
  }

  /**
   * Add a contract to the whitelist.
   */
  async addWhitelistedContract(contractAddress: string): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    const contract = this.contract.connect(this.signer);
    const tx = await contract.addWhitelistedContract(contractAddress);
    return tx.wait();
  }

  /**
   * Add a function to the whitelist.
   */
  async addWhitelistedFunction(
    contractAddress: string,
    functionSignature: string // e.g., "transfer(address,uint256)"
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    const selector = ethers.id(functionSignature).slice(0, 10);
    const contract = this.contract.connect(this.signer);
    const tx = await contract.addWhitelistedFunction(contractAddress, selector);
    return tx.wait();
  }

  /**
   * Pause the Paymaster.
   */
  async pause(): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    const contract = this.contract.connect(this.signer);
    const tx = await contract.pause();
    return tx.wait();
  }

  /**
   * Unpause the Paymaster.
   */
  async unpause(): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) throw new Error('Signer required');
    const contract = this.contract.connect(this.signer);
    const tx = await contract.unpause();
    return tx.wait();
  }

  // ========================================
  // USER FUNCTIONS (gasless execution)
  // ========================================

  /**
   * Execute a gasless transaction.
   * This is the main function users call!
   */
  async executeGasless(
    userSigner: ethers.Signer,
    targetContract: string,
    functionName: string,
    args: any[],
    gasLimit: bigint = 300000n
  ): Promise<GaslessTransactionResult> {
    // 1. Encode the function call
    const targetInterface = new ethers.Interface([`function ${functionName}`]);
    const data = targetInterface.encodeFunctionData(functionName, args);

    // 2. Get user's nonce
    const userAddress = await userSigner.getAddress();
    const nonce = await this.getUserNonce(userAddress);

    // 3. Create deadline (1 hour from now)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    // 4. Create MetaTransaction
    const metaTx = {
      user: userAddress,
      target: targetContract,
      data,
      gasLimit,
      nonce,
      deadline
    };

    // 5. Sign with EIP-712
    const signature = await this.eip712Signer.signMetaTransaction(userSigner, metaTx);

    // 6. Send to relayer backend
    const result = await this.relayerClient.relay(this.address, {
      ...metaTx,
      signature
    });

    return result;
  }

  /**
   * Validate a transaction before execution (dry run).
   */
  async validateGasless(
    userAddress: string,
    targetContract: string,
    data: string,
    gasLimit: bigint
  ): Promise<ValidationResult> {
    const nonce = await this.getUserNonce(userAddress);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return this.relayerClient.validate(this.address, {
      user: userAddress,
      target: targetContract,
      data,
      gasLimit,
      nonce,
      deadline
    });
  }

  // ========================================
  // QUERY FUNCTIONS (read-only)
  // ========================================

  /**
   * Get Paymaster balance.
   */
  async getBalance(): Promise<bigint> {
    return this.provider.getBalance(this.address);
  }

  /**
   * Get user's current nonce.
   */
  async getUserNonce(userAddress: string): Promise<bigint> {
    return this.contract.nonces(userAddress);
  }

  /**
   * Check if contract is whitelisted.
   */
  async isContractWhitelisted(contractAddress: string): Promise<boolean> {
    return this.contract.isWhitelistedContract(contractAddress);
  }

  /**
   * Check if function is whitelisted.
   */
  async isFunctionWhitelisted(
    contractAddress: string,
    functionSelector: string
  ): Promise<boolean> {
    return this.contract.isWhitelistedFunction(contractAddress, functionSelector);
  }

  /**
   * Get spending limits.
   */
  async getSpendingLimits(): Promise<SpendingLimit> {
    return this.contract.getSpendingLimits();
  }

  /**
   * Check if Paymaster is paused.
   */
  async isPaused(): Promise<boolean> {
    return this.contract.paused();
  }

  /**
   * Get Paymaster owner.
   */
  async getOwner(): Promise<string> {
    return this.contract.owner();
  }

  /**
   * Estimate cost for a transaction.
   */
  async estimateCost(
    targetContract: string,
    data: string,
    gasLimit: bigint
  ): Promise<{ estimatedGas: bigint; estimatedCostWei: bigint }> {
    return this.relayerClient.estimateCost(this.address, targetContract, data, gasLimit);
  }
}

// Types
export interface GaslessTransactionResult {
  txHash: string;
  status: 'confirmed' | 'reverted';
  gasUsed: string;
  effectiveGasPrice: string;
}

export interface ValidationResult {
  canExecute: boolean;
  errorCode?: number;
  reason?: string;
  estimatedGas?: string;
  estimatedCost?: string;
}

export interface SpendingLimit {
  perTransactionLimit: bigint;
  dailyLimit: bigint;
  monthlyLimit: bigint;
  globalLimit: bigint;
  dailySpent: bigint;
  monthlySpent: bigint;
  globalSpent: bigint;
}
```

### 3. EIP712Signer

```typescript
import { ethers } from 'ethers';

export class EIP712Signer {
  private provider: ethers.Provider;
  private paymasterAddress: string;

  constructor(provider: ethers.Provider, paymasterAddress: string) {
    this.provider = provider;
    this.paymasterAddress = paymasterAddress;
  }

  async signMetaTransaction(
    signer: ethers.Signer,
    metaTx: MetaTransaction
  ): Promise<string> {
    const network = await this.provider.getNetwork();
    
    const domain = {
      name: 'Paymaster',
      version: '1',
      chainId: network.chainId,
      verifyingContract: this.paymasterAddress
    };

    const types = {
      MetaTransaction: [
        { name: 'user', type: 'address' },
        { name: 'target', type: 'address' },
        { name: 'data', type: 'bytes' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const value = {
      user: metaTx.user,
      target: metaTx.target,
      data: metaTx.data,
      gasLimit: metaTx.gasLimit,
      nonce: metaTx.nonce,
      deadline: metaTx.deadline
    };

    return signer.signTypedData(domain, types, value);
  }
}

interface MetaTransaction {
  user: string;
  target: string;
  data: string;
  gasLimit: bigint;
  nonce: bigint;
  deadline: bigint;
}
```

### 4. RelayerClient (Backend API)

```typescript
export class RelayerClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async health(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.ok;
  }

  async relay(paymasterAddress: string, signedMetaTx: SignedMetaTransaction) {
    const response = await fetch(`${this.baseUrl}/api/v1/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymasterAddress,
        metaTx: {
          ...signedMetaTx,
          gasLimit: signedMetaTx.gasLimit.toString(),
          nonce: signedMetaTx.nonce.toString(),
          deadline: signedMetaTx.deadline.toString()
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Relay failed');
    }

    return response.json();
  }

  async validate(paymasterAddress: string, metaTx: MetaTransaction) {
    const response = await fetch(`${this.baseUrl}/api/v1/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymasterAddress,
        metaTx: {
          ...metaTx,
          gasLimit: metaTx.gasLimit.toString(),
          nonce: metaTx.nonce.toString(),
          deadline: metaTx.deadline.toString()
        }
      })
    });

    return response.json();
  }

  async estimateCost(
    paymasterAddress: string,
    target: string,
    data: string,
    gasLimit: bigint
  ) {
    // Implementation similar to relay
  }

  async getTransactionStatus(txHash: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/transaction/${txHash}`);
    return response.json();
  }
}
```

---

## Usage Examples

### Example 1: User Executes Gasless Transaction

```typescript
import { MantleGaslessSDK } from 'mantle-gasless-sdk';
import { ethers } from 'ethers';

// Setup
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const sdk = new MantleGaslessSDK(
  provider,
  'https://relayer.mantle-gasless.xyz',
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'
);

// Get Paymaster (developer's)
const paymaster = sdk.getPaymaster('0xDeveloperPaymasterAddress');

// Execute gasless ERC20 transfer
const result = await paymaster.executeGasless(
  signer,                           // User signs (no gas!)
  '0xMyTokenAddress',               // Target contract
  'transfer(address,uint256)',      // Function
  ['0xRecipient', ethers.parseEther('100')],  // Args
  300000n                           // Gas limit
);

console.log('Transaction hash:', result.txHash);
console.log('Status:', result.status);
```

### Example 2: Developer Manages Paymaster

```typescript
import { MantleGaslessSDK } from 'mantle-gasless-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
const developerWallet = new ethers.Wallet(PRIVATE_KEY, provider);

const sdk = new MantleGaslessSDK(
  provider,
  'https://relayer.mantle-gasless.xyz',
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'
);

// 1. Create new Paymaster
const paymaster = await sdk.createPaymaster(developerWallet);
console.log('Paymaster created:', paymaster.address);

// 2. Fund it
await paymaster.deposit(ethers.parseEther('10'));

// 3. Whitelist ERC20 contract
await paymaster.addWhitelistedContract('0xMyTokenAddress');

// 4. Whitelist transfer function
await paymaster.addWhitelistedFunction(
  '0xMyTokenAddress',
  'transfer(address,uint256)'
);

// 5. Check balance
const balance = await paymaster.getBalance();
console.log('Paymaster balance:', ethers.formatEther(balance), 'MNT');
```

---

## Publishing the SDK

### package.json
```json
{
  "name": "mantle-gasless-sdk",
  "version": "1.0.0",
  "description": "SDK for gasless transactions on Mantle Network",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "ethers": "^6.0.0"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "keywords": ["mantle", "gasless", "meta-transaction", "l2"],
  "author": "Mantle Gas-Less Team",
  "license": "MIT"
}
```

### Publish to NPM
```bash
npm login
npm publish --access public
```

### Usage after publishing
```bash
npm install mantle-gasless-sdk ethers
```

---

## Next Steps

1. **Implement SDK** (1-2 weeks)
   - Core classes (MantleGaslessSDK, PaymasterClient, etc.)
   - EIP-712 signing
   - Backend API client
   - Error handling

2. **Test SDK** (1 week)
   - Integration tests with testnet
   - Example applications
   - Documentation

3. **Publish SDK** (1 day)
   - Publish to NPM
   - Create documentation site
   - Example repository

4. **Developer Dashboard** (2-3 weeks)
   - Next.js frontend
   - Uses SDK internally
   - Paymaster management UI
   - Analytics

---

## Benefits of SDK Approach

✅ **Abstraction**: Developers don't deal with EIP-712, nonces, encoding  
✅ **Type Safety**: Full TypeScript support  
✅ **Error Handling**: Normalized errors with helpful messages  
✅ **Testing**: Easy to mock for unit tests  
✅ **Updates**: Can update backend without breaking SDK  
✅ **Documentation**: Single source of truth for integration  
