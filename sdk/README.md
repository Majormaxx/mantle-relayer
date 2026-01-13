# @mantle-relayer/sdk

TypeScript SDK for the Mantle Gas-Less Relayer service. Build, sign, and submit EIP-712 meta-transactions with security-first design.

## Features

- **EIP-712 Signing** - Type-safe meta-transaction signing
- **Fluent Builder API** - Easy transaction construction with validation
- **Retry & Timeout** - Robust HTTP client with exponential backoff
- **Type Safety** - Full TypeScript with strict mode
- **Input Validation** - Zod schemas for all inputs

## Installation

```bash
npm install @mantle-relayer/sdk
```

## Quick Start

```typescript
import { MantleRelayerClient } from '@mantle-relayer/sdk';
import { Wallet } from 'ethers';

// Initialize client for Mantle Testnet
const client = MantleRelayerClient.forTestnet('https://relay.your-domain.com');

// Create a signer
const signer = new Wallet(process.env.PRIVATE_KEY);

// Build and sign a meta-transaction
const signedTx = await client.buildTransaction()
  .setPaymaster('0x...')           // Paymaster contract address
  .setTarget('0x...')              // Target contract to call
  .setCallData('0x...')            // Encoded function call
  .setGasLimit(100000n)            // Gas limit
  .sign(signer);                   // Sign with EIP-712

// Submit to relayer
const result = await client.relay(paymasterAddress, signedTx);
console.log('TX Hash:', result.txHash);
```

## API Reference

### MantleRelayerClient

Main SDK entry point.

```typescript
// Factory methods
const client = MantleRelayerClient.forTestnet(relayerUrl);
const client = MantleRelayerClient.forMainnet(relayerUrl);

// Or configure manually
const client = new MantleRelayerClient({
  relayerUrl: 'https://relay.example.com',
  chainId: 5003,
  rpcUrl: 'https://rpc.sepolia.mantle.xyz', // Optional
  timeout: 30000,
  retryAttempts: 3,
});

// Methods
await client.relay(paymasterAddress, signedTx);  // Submit transaction
await client.validate(paymasterAddress, metaTx); // Dry run validation
await client.estimateCost(...);                  // Estimate gas cost
await client.getNonce(paymaster, user);          // Get user nonce
await client.getPaymasterInfo(address);          // Get Paymaster status
```

### MetaTransactionBuilder

Fluent API for transaction construction.

```typescript
const tx = await client.buildTransaction()
  .setPaymaster('0x...')
  .setTarget('0x...')
  .setCallData('0x...')
  .setGasLimit(100000n)
  .setDeadline('auto')  // Auto: 5 min from now
  .build();             // Returns unsigned MetaTransaction

// Or sign directly
const signedTx = await builder.sign(signer);
```

### Error Handling

```typescript
import { 
  RelayError,
  ValidationError,
  TransactionExpiredError,
  ERROR_CODES 
} from '@mantle-relayer/sdk';

try {
  await client.relay(paymaster, signedTx);
} catch (error) {
  if (error instanceof TransactionExpiredError) {
    console.log('Deadline passed, rebuild transaction');
  } else if (error instanceof RelayError) {
    if (error.errorCode === ERROR_CODES.INSUFFICIENT_BALANCE) {
      console.log('Paymaster needs more funds');
    }
  }
}
```

## Security

- **EIP-712 Typed Signing** - Clear signing data in wallets
- **Deadline Enforcement** - Transactions expire after 5 minutes
- **Nonce Protection** - Automatic nonce management
- **Input Validation** - All inputs validated with Zod
- **Domain Separation** - Chain ID in signature prevents cross-chain replay

## License

MIT
