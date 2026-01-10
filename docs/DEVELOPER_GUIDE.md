# Mantle Gasless Relayer - Developer Documentation

Complete documentation for developers integrating gasless transactions into their dApps.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Getting Started](#getting-started)
4. [SDK Integration Guide](#sdk-integration-guide)
5. [Smart Contract Integration](#smart-contract-integration)
6. [API Reference](#api-reference)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

### What is Mantle Gasless Relayer?

Mantle Gasless Relayer is a meta-transaction infrastructure that allows users to interact with smart contracts **without paying gas fees**. Developers sponsor gas fees for their users through **Paymasters**.

### Key Benefits

✨ **For Users:**
- No MNT needed for transactions
- Seamless onboarding
- Better UX for blockchain apps

✨ **For Developers:**
- Increase user adoption
- Control which contracts/functions users can access
- Pay for gas only when needed
- Detailed analytics on usage

### How It Works

```
User → Signs Transaction (EIP-712) → Relayer Backend → On-Chain Execution
                                          ↓
                                    Paymaster Pays Gas
```

1. **User** signs a meta-transaction with their wallet (no gas)
2. **Backend Relayer** validates and submits to blockchain
3. **Paymaster** pays the gas fees
4. **User** gets transaction executed without owning MNT

---

## Architecture Overview

### Components

```
┌─────────────┐        ┌──────────────────┐       ┌─────────────────┐
│   Frontend  │───────>│  Gasless SDK     │──────>│ Relayer Backend │
│   (dApp)    │<───────│  (@mantle/sdk)   │<──────│   (Node.js)     │
└─────────────┘        └──────────────────┘       └─────────────────┘
                                                            │
                                                            ↓
                                                   ┌─────────────────┐
                                                   │  Smart Contracts│
                                                   │  - RelayerHub   │
                                                   │  - Paymaster    │
                                                   │  - Your Contract│
                                                   └─────────────────┘
```

### Smart Contracts

1. **RelayerHub**: Central hub for meta-transaction execution
2. **PaymasterFactory**: Deploys new Paymasters for developers
3. **Paymaster**: Per-developer contract that pays gas fees

### Backend Relayer

- Validates meta-transactions
- Manages nonces
- Submits to blockchain
- Handles errors

### SDK

- TypeScript/JavaScript library
- Simplifies integration
- Type-safe API

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Basic knowledge of ethers.js
- Mantle Sepolia testnet access

### Installation

```bash
npm install @mantle-relayer/sdk ethers
```

### Quick Start (5 Minutes)

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// 1. Setup provider
const provider = new ethers.BrowserProvider(window.ethereum);

// 2. Initialize SDK
const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003,
});

// 3. Execute gasless transaction
const signer = await provider.getSigner();
const paymaster = sdk.getPaymaster('0xYourPaymasterAddress');

const result = await paymaster.executeGasless(
  signer,
  '0xTokenAddress',
  'transfer(address,uint256)',
  [recipientAddress, ethers.parseEther('100')]
);

console.log('Transaction Hash:', result.txHash);
// User paid NO gas! 🎉
```

---

## SDK Integration Guide

### Step 1: Setup SDK

#### Browser (React, Vue, etc.)

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

// MetaMask or other injected provider
const provider = new ethers.BrowserProvider(window.ethereum);

const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003,
  timeout: 30000, // Optional: request timeout in ms
});
```

#### Node.js (Backend)

```typescript
import { MantleGaslessSDK } from '@mantle-relayer/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');

const sdk = new MantleGaslessSDK(provider, {
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003,
});
```

### Step 2: Deploy Your Paymaster

As a developer, you need to deploy a Paymaster to sponsor gas:

```typescript
import { ethers } from 'ethers';

// Connect with your developer wallet
const developerWallet = new ethers.Wallet(privateKey, provider);

// Get factory contract
const factory = new ethers.Contract(
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  ['function createPaymaster() returns (address)'],
  developerWallet
);

// Deploy Paymaster
const tx = await factory.createPaymaster();
const receipt = await tx.wait();

// Get Paymaster address from event logs
const paymasterAddress = '0x...'; // Extract from events

console.log('Paymaster deployed at:', paymasterAddress);
```

### Step 3: Fund Your Paymaster

```typescript
const paymaster = sdk.getPaymaster(paymasterAddress, developerWallet);

// Deposit MNT to cover gas fees
await paymaster.deposit(ethers.parseEther('10')); // 10 MNT

const balance = await paymaster.getBalance();
console.log('Paymaster balance:', ethers.formatEther(balance), 'MNT');
```

### Step 4: Configure Whitelists

```typescript
// Whitelist your smart contract
await paymaster.addWhitelistedContract('0xYourContractAddress');

// Whitelist specific functions
await paymaster.addWhitelistedFunction(
  '0xYourContractAddress',
  'transfer(address,uint256)'
);

await paymaster.addWhitelistedFunction(
  '0xYourContractAddress',
  'mint(address,uint256)'
);
```

### Step 5: Execute Gasless Transactions

```typescript
// User connects wallet
const userSigner = await provider.getSigner();

// Get Paymaster client (no signer needed for users)
const paymaster = sdk.getPaymaster(paymasterAddress);

// Execute gasless transaction
const result = await paymaster.executeGasless(
  userSigner,
  '0xYourContractAddress',
  'transfer(address,uint256)',
  [recipientAddress, ethers.parseEther('100')]
);

console.log('Success!', result.txHash);
```

---

## Smart Contract Integration

### Making Your Contract Gasless-Compatible

Your contract doesn't need any modifications! The Paymaster works with **any** standard smart contract.

### Example: ERC20 Token

```solidity
// Your existing ERC20 token - NO CHANGES NEEDED
contract MyToken is ERC20 {
    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
}
```

Just whitelist it in your Paymaster:

```typescript
await paymaster.addWhitelistedContract(tokenAddress);
await paymaster.addWhitelistedFunction(tokenAddress, 'transfer(address,uint256)');
```

### Example: NFT Contract

```solidity
// Your existing NFT contract - NO CHANGES NEEDED
contract MyNFT is ERC721 {
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}
```

Whitelist the mint function:

```typescript
await paymaster.addWhitelistedContract(nftAddress);
await paymaster.addWhitelistedFunction(nftAddress, 'mint(address,uint256)');
```

### Best Practices

1. **Whitelist only necessary contracts**  
   Reduce risk by limiting which contracts can use your Paymaster.

2. **Whitelist only needed functions**  
   Don't whitelist dangerous functions like `transferOwnership`.

3. **Set gas limits**  
   Prevent abuse by setting max gas per transaction.

4. **Monitor usage**  
   Track analytics to understand usage patterns.

---

## API Reference

### MantleGaslessSDK

#### Constructor

```typescript
new MantleGaslessSDK(
  provider: Provider,
  config: {
    relayerUrl: string;
    factoryAddress: string;
    chainId?: number;
    timeout?: number;
  }
)
```

#### Methods

**`getPaymaster(address: string, signer?: Signer): PaymasterClient`**

Get a Paymaster client instance.

- `address`: Paymaster contract address
- `signer`: Optional signer for admin operations

**`isRelayerHealthy(): Promise<boolean>`**

Check if the relayer backend is operational.

---

### PaymasterClient

#### User Methods

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

Execute a gasless transaction.

**Parameters:**
- `userSigner`: User's ethers Signer
- `targetContract`: Target contract address
- `functionSignature`: Function signature (e.g., `'transfer(address,uint256)'`)
- `args`: Function arguments array
- `gasLimit`: Optional custom gas limit
- `deadlineSeconds`: Optional deadline in seconds (default: 300)

**Returns:**
```typescript
{
  txHash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  gasUsed?: bigint;
}
```

**Example:**
```typescript
const result = await paymaster.executeGasless(
  userSigner,
  '0xTokenAddress',
  'transfer(address,uint256)',
  ['0xRecipient', ethers.parseEther('100')]
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

Validate a transaction before execution (dry run).

**Returns:**
```typescript
{
  canExecute: boolean;
  reason?: string;
  estimatedGas?: bigint;
  estimatedCost?: bigint;
}
```

#### Query Methods

**`getInfo(): Promise<PaymasterInfo>`**

Get comprehensive Paymaster information.

**`getUserNonce(userAddress: string): Promise<bigint>`**

Get user's current nonce for this Paymaster.

**`getBalance(): Promise<bigint>`**

Get Paymaster's MNT balance.

**`isContractWhitelisted(address: string): Promise<boolean>`**

Check if a contract is whitelisted.

**`isFunctionWhitelisted(contract: string, selector: string): Promise<boolean>`**

Check if a function is whitelisted.

#### Admin Methods (Owner Only)

**`deposit(amount: bigint): Promise<TransactionResponse>`**

Deposit MNT into Paymaster.

**`withdraw(amount: bigint, recipient: string): Promise<TransactionResponse>`**

Withdraw MNT from Paymaster.

**`addWhitelistedContract(address: string): Promise<TransactionResponse>`**

Add a contract to the whitelist.

**`removeWhitelistedContract(address: string): Promise<TransactionResponse>`**

Remove a contract from the whitelist.

**`addWhitelistedFunction(contract: string, signature: string): Promise<TransactionResponse>`**

Add a function to the whitelist.

**`removeWhitelistedFunction(contract: string, selector: string): Promise<TransactionResponse>`**

Remove a function from the whitelist.

**`pause(): Promise<TransactionResponse>`**

Pause the Paymaster (emergency stop).

**`unpause(): Promise<TransactionResponse>`**

Unpause the Paymaster.

---

## Security Best Practices

### For Developers

1. **Secure Your Private Key**
   - Never expose your developer private key
   - Use environment variables
   - Consider using a hardware wallet

2. **Whitelist Carefully**
   - Only whitelist contracts you control
   - Only whitelist safe functions
   - Avoid whitelisting `selfdestruct` or transfer ownership functions

3. **Set Gas Limits**
   ```typescript
   await paymaster.setMaxGasPerTransaction(500000n);
   ```

4. **Monitor Balance**
   - Set up alerts for low balance
   - Regularly check analytics
   - Pause if suspicious activity detected

5. **Test on Testnet First**
   - Always test on Mantle Sepolia
   - Verify all functionality
   - Load test before mainnet

### For Users

1. **Verify Signatures**
   - Always review EIP-712 signatures
   - Check the domain (chainId, contract address)
   - Verify deadline and nonce

2. **Check Paymaster**
   - Verify Paymaster address
   - Check it's funded and active

3. **Use Trusted dApps**
   - Only connect to reputable dApps
   - Verify contract addresses

---

## Troubleshooting

### Common Issues

#### 1. "INSUFFICIENT_BALANCE" Error

**Problem:** Paymaster has insufficient MNT.

**Solution:**
```typescript
const balance = await paymaster.getBalance();
if (balance < ethers.parseEther('1')) {
  await paymaster.deposit(ethers.parseEther('10'));
}
```

#### 2. "CONTRACT_NOT_WHITELISTED" Error

**Problem:** Target contract not whitelisted.

**Solution:**
```typescript
await paymaster.addWhitelistedContract(targetContractAddress);
```

#### 3. "FUNCTION_NOT_WHITELISTED" Error

**Problem:** Function not whitelisted.

**Solution:**
```typescript
await paymaster.addWhitelistedFunction(
  targetContractAddress,
  'functionName(type1,type2)'
);
```

#### 4. "PAYMASTER_PAUSED" Error

**Problem:** Paymaster is paused.

**Solution:**
```typescript
await paymaster.unpause();
```

#### 5. "Signature Verification Failed"

**Problem:** EIP-712 signature invalid.

**Solution:**
- Check chainId matches
- Verify Paymaster address is correct
- Ensure nonce is current
- Check deadline hasn't expired

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
process.env.DEBUG = 'mantle-relayer:*';

// Or in code
sdk.setLogLevel('debug');
```

---

## FAQ

### General Questions

**Q: Do users need MNT in their wallet?**  
A: No! That's the whole point. Users can transact with zero balance.

**Q: How much does it cost developers?**  
A: You pay the actual gas cost of transactions. No additional fees.

**Q: Can I use this on Mantle mainnet?**  
A: Currently Sepolia testnet only. Mainnet coming soon.

**Q: Is there a limit on transactions?**  
A: Only limited by your Paymaster balance and gas limits you set.

### Technical Questions

**Q: What's the max gas per transaction?**  
A: Default is 500,000. You can configure this per Paymaster.

**Q: How long are signatures valid?**  
A: Default 5 minutes (300 seconds). You can customize the deadline.

**Q: Can multiple users share one Paymaster?**  
A: Yes! One Paymaster can sponsor transactions for unlimited users.

**Q: What happens if my Paymaster runs out of MNT?**  
A: Transactions will fail until you refill it. Set up monitoring!

**Q: Can I restrict which users can use my Paymaster?**  
A: Not yet, but coming soon. Current control is contract/function level.

### Integration Questions

**Q: Do I need to modify my smart contracts?**  
A: No! Works with any existing contract.

**Q: Can I use this with ethers.js v5?**  
A: No, requires ethers.js v6.

**Q: Does this work with WalletConnect?**  
A: Yes! Any Web3 provider works.

**Q: Can I build my own relayer backend?**  
A: Yes, it's open source. See backend documentation.

---

## Support & Resources

- **📚 Full Documentation**: [docs.mantle-gasless.xyz](https://docs.mantle-gasless.xyz)
- **💬 Discord**: [Join our Discord](https://discord.gg/your-invite)
- **🐙 GitHub**: [github.com/your-org/mantle-relayer](https://github.com/your-org/mantle-relayer)
- **🐛 Report Issues**: [GitHub Issues](https://github.com/your-org/mantle-relayer/issues)
- **📧 Email**: support@mantle-gasless.xyz

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
