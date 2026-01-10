# SDK Examples

This directory contains practical examples demonstrating how to use the Mantle Gasless SDK.

## Examples Overview

### 1. [basic-usage.ts](./basic-usage.ts)
**Purpose:** Simple gasless token transfer  
**What you'll learn:**
- SDK initialization
- Connecting to Mantle Network
- Validating transactions
- Executing gasless transactions
- Error handling

**Run it:**
```bash
export RELAYER_URL=http://localhost:3000
export PAYMASTER_ADDRESS=0x...
export USER_PRIVATE_KEY=0x...
export TOKEN_ADDRESS=0x...
export RECIPIENT_ADDRESS=0x...

npx ts-node examples/basic-usage.ts
```

### 2. [react-integration.tsx](./react-integration.tsx)
**Purpose:** React application with gasless transfers  
**What you'll learn:**
- React hooks for SDK
- Wallet connection (MetaMask)
- UI for gasless transactions
- Custom hooks for reusability

**Use it:**
```bash
# Copy this file into your React project
cp examples/react-integration.tsx src/components/GaslessTransfer.tsx
```

### 3. [paymaster-management.ts](./paymaster-management.ts)
**Purpose:** Complete Paymaster lifecycle management  
**What you'll learn:**
- Deploying new Paymasters
- Funding Paymasters
- Configuring whitelists
- Monitoring usage and balance
- Maintenance operations

**Run it:**
```bash
export RELAYER_URL=http://localhost:3000
export DEVELOPER_PRIVATE_KEY=0x...
export TOKEN_ADDRESS=0x...

npx ts-node examples/paymaster-management.ts
```

## Prerequisites

1. **Node.js** v18 or higher
2. **Mantle Sepolia Testnet** RPC access
3. **Test MNT** tokens (get from [faucet](https://faucet.sepolia.mantle.xyz))
4. **MetaMask** or other Web3 wallet (for browser examples)

## Environment Setup

Create a `.env` file:

```env
# Relayer Backend
RELAYER_URL=https://relayer-sepolia.mantle-gasless.xyz

# Smart Contracts
PAYMASTER_FACTORY=0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
PAYMASTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...

# Test Wallets
DEVELOPER_PRIVATE_KEY=0x...
USER_PRIVATE_KEY=0x...
RECIPIENT_ADDRESS=0x...

# Network
CHAIN_ID=5003
RPC_URL=https://rpc.sepolia.mantle.xyz
```

## Quick Start Guide

### For End Users (Gasless Transactions)

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// 1. Setup
const provider = new ethers.BrowserProvider(window.ethereum);
const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
});

// 2. Execute
const signer = await provider.getSigner();
const paymaster = sdk.getPaymaster('0xPaymasterAddress');

const result = await paymaster.executeGasless(
  signer,
  '0xTokenAddress',
  'transfer(address,uint256)',
  [recipientAddress, amount]
);

console.log('TX Hash:', result.txHash);
// User paid ZERO gas! 🎉
```

### For Developers (Paymaster Setup)

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// 1. Deploy Paymaster
const factory = new ethers.Contract(factoryAddress, [...], wallet);
const tx = await factory.createPaymaster();
const receipt = await tx.wait();
// Get address from event

// 2. Fund it
const paymaster = sdk.getPaymaster(paymasterAddress, wallet);
await paymaster.deposit(ethers.parseEther('10'));

// 3. Configure
await paymaster.addWhitelistedContract(tokenAddress);
await paymaster.addWhitelistedFunction(tokenAddress, 'transfer(address,uint256)');

// 4. Monitor
const info = await paymaster.getInfo();
console.log('Balance:', info.balance);
console.log('Total TXs:', info.analytics.totalTransactions);
```

## Common Use Cases

### Use Case 1: NFT Minting (Zero Gas for Users)

```typescript
const result = await paymaster.executeGasless(
  userSigner,
  nftContractAddress,
  'mint(address,uint256)',
  [userAddress, tokenId]
);
```

### Use Case 2: Token Swaps

```typescript
// Approve first
await paymaster.executeGasless(
  userSigner,
  tokenAddress,
  'approve(address,uint256)',
  [dexAddress, amount]
);

// Then swap
await paymaster.executeGasless(
  userSigner,
  dexAddress,
  'swap(address,address,uint256)',
  [tokenIn, tokenOut, amountIn]
);
```

### Use Case 3: Gaming Actions

```typescript
// Attack in game
await paymaster.executeGasless(
  userSigner,
  gameContractAddress,
  'attack(uint256,uint256)',
  [attackerId, targetId]
);
```

### Use Case 4: Social Media (On-Chain Posts)

```typescript
await paymaster.executeGasless(
  userSigner,
  socialContractAddress,
  'createPost(string,string)',
  [title, contentHash]
);
```

## Error Handling

Common errors and solutions:

```typescript
try {
  await paymaster.executeGasless(...);
} catch (error) {
  if (error.message.includes('INSUFFICIENT_BALANCE')) {
    // Paymaster needs more MNT
    await paymaster.deposit(ethers.parseEther('10'));
  } else if (error.message.includes('CONTRACT_NOT_WHITELISTED')) {
    // Add contract to whitelist
    await paymaster.addWhitelistedContract(targetContract);
  } else if (error.message.includes('FUNCTION_NOT_WHITELISTED')) {
    // Add function to whitelist
    await paymaster.addWhitelistedFunction(targetContract, functionSig);
  } else if (error.message.includes('PAYMASTER_PAUSED')) {
    // Unpause Paymaster
    await paymaster.unpause();
  } else if (error.message.includes('NONCE_TOO_LOW')) {
    // Nonce issue - retry
    await paymaster.executeGasless(...); // Will fetch fresh nonce
  }
}
```

## Testing

### Unit Tests (Coming Soon)
```bash
npm test
```

### Integration Tests (Coming Soon)
```bash
npm run test:integration
```

### Manual Testing Checklist

- [ ] SDK initializes correctly
- [ ] Relayer health check works
- [ ] Paymaster info retrieval works
- [ ] User nonce retrieval works
- [ ] Transaction validation works
- [ ] Gasless transaction executes successfully
- [ ] Transaction status updates correctly
- [ ] Errors are handled gracefully
- [ ] EIP-712 signature verification passes
- [ ] Whitelisting works correctly

## Advanced Topics

### Custom Gas Limits

```typescript
await paymaster.executeGasless(
  signer,
  targetContract,
  functionSignature,
  args,
  500000n  // Custom gas limit
);
```

### Custom Deadlines

```typescript
import { createDeadline } from '@mantle-relayer/sdk';

const deadline = createDeadline(600); // 10 minutes

// Manual meta-transaction creation
const metaTx = {
  from: userAddress,
  to: targetContract,
  value: 0n,
  data: encodedData,
  nonce,
  deadline,
  gasLimit: 300000n,
  paymasterAddress,
};
```

### Transaction Monitoring

```typescript
const result = await paymaster.executeGasless(...);

// Wait for confirmations
const receipt = await provider.waitForTransaction(result.txHash, 3);

console.log('Confirmed in block:', receipt.blockNumber);
console.log('Gas used:', receipt.gasUsed.toString());
```

## Support

- **Documentation:** [docs.mantle-gasless.xyz](https://docs.mantle-gasless.xyz)
- **GitHub:** [github.com/your-org/mantle-relayer](https://github.com/your-org/mantle-relayer)
- **Discord:** [Your Discord Server]
- **Issues:** [GitHub Issues](https://github.com/your-org/mantle-relayer/issues)

## Contributing

Found a bug or want to add an example? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Add your example with documentation
4. Submit a pull request

## License

MIT
