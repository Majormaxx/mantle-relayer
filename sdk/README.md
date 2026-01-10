# @mantle-relayer/sdk

Official SDK for gasless transactions on Mantle Network using the Mantle Gas-Less Relayer.

## Features

✨ **Zero Gas for Users** - Users don't need MNT to interact with your dApp  
🔐 **Secure EIP-712 Signatures** - Industry-standard meta-transaction signing  
🚀 **Simple Integration** - Just a few lines of code  
📦 **TypeScript Support** - Full type definitions included  
⚡ **Optimized** - Automatic nonce management and gas estimation  

## Installation

```bash
npm install @mantle-relayer/sdk ethers
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// Setup provider (browser)
const provider = new ethers.BrowserProvider(window.ethereum);

// Initialize SDK
const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003 // Mantle Sepolia
});
```

### 2. Execute a Gasless Transaction

```typescript
// Get user's signer
const signer = await provider.getSigner();

// Get Paymaster (developer's)
const paymaster = sdk.getPaymaster('0xYourPaymasterAddress');

// Execute gasless ERC20 transfer - User pays NO gas!
const result = await paymaster.executeGasless(
  signer,                               // User's wallet
  '0xTokenAddress',                     // Target contract
  'transfer(address,uint256)',          // Function signature
  [recipientAddress, ethers.parseEther('100')]  // Arguments
);

console.log('Transaction hash:', result.txHash);
console.log('Status:', result.status);
```

That's it! The user just transferred tokens without paying any gas fees! 🎉

## For Developers: Setting Up Your Paymaster

### Deploy and Configure Paymaster

```typescript
import { ethers } from 'ethers';

// 1. Deploy Paymaster (call factory contract)
const factory = new ethers.Contract(
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  ['function createPaymaster() returns (address)'],
  developerWallet
);

const tx = await factory.createPaymaster();
const receipt = await tx.wait();
// Get Paymaster address from event logs

// 2. Fund your Paymaster
await developerWallet.sendTransaction({
  to: paymasterAddress,
  value: ethers.parseEther('10') // 10 MNT
});

// 3. Whitelist contracts and functions
const paymaster = sdk.getPaymaster(paymasterAddress, developerWallet);

await paymaster.addWhitelistedContract('0xYourTokenAddress');
await paymaster.addWhitelistedFunction(
  '0xYourTokenAddress',
  'transfer(address,uint256)'
);
```

## Core API

### MantleGaslessSDK

#### Constructor

```typescript
new MantleGaslessSDK(provider: Provider, config: SDKConfig)
```

**Config Options:**
- `relayerUrl` - Backend relayer URL
- `factoryAddress` - PaymasterFactory contract address
- `chainId` - Network chain ID (default: 5003)
- `timeout` - Request timeout in ms (default: 30000)

#### Methods

**`getPaymaster(address: string, signer?: Signer): PaymasterClient`**  
Get a Paymaster client instance.

**`isRelayerHealthy(): Promise<boolean>`**  
Check if relayer backend is operational.

---

### PaymasterClient

#### User Functions (Gasless Execution)

**`executeGasless()`**
```typescript
async executeGasless(
  userSigner: Signer,
  targetContract: string,
  functionSignature: string,
  args: any[],
  gasLimit?: bigint,
  deadlineSeconds?: number
): Promise<GaslessTransactionResult>
```

Execute a gasless transaction. The user signs with EIP-712, and the transaction is relayed by the backend.

**Example:**
```typescript
const result = await paymaster.executeGasless(
  userSigner,
  '0xNFTContract',
  'mint(address,uint256)',
  [userAddress, tokenId],
  400000n  // Optional gas limit
);
```

**`validateGasless()`**
```typescript
async validateGasless(
  userAddress: string,
  targetContract: string,
  functionSignature: string,
  args: any[],
  gasLimit?: bigint
): Promise<ValidationResult>
```

Validate a transaction before execution (dry run). Returns whether it can execute and estimated costs.

**Example:**
```typescript
const validation = await paymaster.validateGasless(
  userAddress,
  '0xToken',
  'transfer(address,uint256)',
  [recipient, amount]
);

if (validation.canExecute) {
  console.log('Estimated gas:', validation.estimatedGas);
  console.log('Estimated cost:', validation.estimatedCost);
} else {
  console.log('Cannot execute:', validation.reason);
}
```

#### Query Functions

**`getInfo(): Promise<PaymasterInfo>`**  
Get comprehensive Paymaster information (balance, limits, analytics).

**`getUserNonce(userAddress: string): Promise<bigint>`**  
Get user's current nonce.

**`getBalance(): Promise<bigint>`**  
Get Paymaster's MNT balance.

**`isContractWhitelisted(address: string): Promise<boolean>`**  
Check if contract is whitelisted.

**`isFunctionWhitelisted(contract: string, selector: string): Promise<boolean>`**  
Check if function is whitelisted.

**`getOwner(): Promise<string>`**  
Get Paymaster owner address.

**`isPaused(): Promise<boolean>`**  
Check if Paymaster is paused.

#### Admin Functions (Owner Only)

**`deposit(amount: bigint): Promise<TransactionResponse>`**  
Deposit MNT into Paymaster.

**`addWhitelistedContract(address: string): Promise<TransactionResponse>`**  
Add contract to whitelist.

**`addWhitelistedFunction(contract: string, signature: string): Promise<TransactionResponse>`**  
Add function to whitelist.

## Examples

### Example 1: Simple ERC20 Transfer

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

async function transferTokens() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const sdk = new MantleGaslessSDK(provider, {
    relayerUrl: 'https://relayer.mantle-gasless.xyz',
    factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  });

  const paymaster = sdk.getPaymaster('0xPaymasterAddress');

  const result = await paymaster.executeGasless(
    signer,
    '0xTokenAddress',
    'transfer(address,uint256)',
    ['0xRecipient', ethers.parseEther('100')]
  );

  console.log('Success! TX:', result.txHash);
}
```

### Example 2: NFT Minting

```typescript
async function mintNFT() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  
  const sdk = new MantleGaslessSDK(provider, {
    relayerUrl: 'https://relayer.mantle-gasless.xyz',
    factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  });

  const paymaster = sdk.getPaymaster('0xPaymasterAddress');

  // Validate first
  const validation = await paymaster.validateGasless(
    userAddress,
    '0xNFTContract',
    'mint(address)',
    [userAddress]
  );

  if (!validation.canExecute) {
    throw new Error(`Cannot mint: ${validation.reason}`);
  }

  // Execute
  const result = await paymaster.executeGasless(
    signer,
    '0xNFTContract',
    'mint(address)',
    [userAddress]
  );

  return result.txHash;
}
```

### Example 3: Check Paymaster Status

```typescript
async function checkPaymaster() {
  const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
  
  const sdk = new MantleGaslessSDK(provider, {
    relayerUrl: 'https://relayer.mantle-gasless.xyz',
    factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  });

  const paymaster = sdk.getPaymaster('0xPaymasterAddress');

  const info = await paymaster.getInfo();
  
  console.log('Owner:', info.owner);
  console.log('Balance:', ethers.formatEther(info.balance), 'MNT');
  console.log('Is Paused:', info.isPaused);
  console.log('Total Transactions:', info.analytics.totalTransactions.toString());
  console.log('Whitelisted Contracts:', info.whitelistedContracts);
}
```

## TypeScript Support

Full TypeScript support with detailed type definitions:

```typescript
import type {
  MetaTransaction,
  GaslessTransactionResult,
  ValidationResult,
  PaymasterInfo,
  SDKConfig,
} from '@mantle-relayer/sdk';
```

## Error Handling

The SDK throws descriptive errors:

```typescript
try {
  await paymaster.executeGasless(...);
} catch (error) {
  if (error.message.includes('INSUFFICIENT_BALANCE')) {
    console.error('Paymaster has insufficient funds');
  } else if (error.message.includes('CONTRACT_NOT_WHITELISTED')) {
    console.error('Target contract not whitelisted');
  } else if (error.message.includes('FUNCTION_NOT_WHITELISTED')) {
    console.error('Function not whitelisted');
  } else {
    console.error('Transaction failed:', error.message);
  }
}
```

## React Integration

```typescript
import { useEffect, useState } from 'react';
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

function useGaslessSDK() {
  const [sdk, setSDK] = useState<MantleGaslessSDK | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const instance = new MantleGaslessSDK(provider, {
        relayerUrl: 'https://relayer.mantle-gasless.xyz',
        factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
      });
      setSDK(instance);
    }
  }, []);

  return sdk;
}

export default function TransferButton() {
  const sdk = useGaslessSDK();

  const handleTransfer = async () => {
    if (!sdk) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const paymaster = sdk.getPaymaster('0xPaymasterAddress');

    const result = await paymaster.executeGasless(
      signer,
      '0xToken',
      'transfer(address,uint256)',
      ['0xRecipient', ethers.parseEther('10')]
    );

    alert(`Transaction sent: ${result.txHash}`);
  };

  return <button onClick={handleTransfer}>Send Tokens (No Gas!)</button>;
}
```

## Network Configuration

### Mantle Sepolia Testnet
```typescript
{
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003
}
```

### Mantle Mainnet (When Available)
```typescript
{
  relayerUrl: 'https://relayer.mantle-gasless.xyz',
  factoryAddress: '0x...', // TBD
  chainId: 5000
}
```

## Requirements

- Node.js ≥ 18
- ethers.js ^6.0.0

## License

MIT

## Support

- Documentation: https://docs.mantle-gasless.xyz
- GitHub: https://github.com/your-org/mantle-relayer
- Discord: [Your Discord]

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.
