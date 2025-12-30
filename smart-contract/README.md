# Mantle Gas-Less Relayer - Smart Contracts

A gasless transaction system on Mantle L2 that allows developers to sponsor user transactions, eliminating the need for users to hold MNT for gas fees.

## 📋 Table of Contents

- [Overview](#overview)
- [Deployed Contracts](#deployed-contracts)
- [Architecture](#architecture)
- [Contract Functions](#contract-functions)
- [Integration Guide](#integration-guide)
- [SDK Implementation](#sdk-implementation)
- [Development](#development)
- [Testing](#testing)

---

## 🌟 Overview

The Mantle Gas-Less Relayer system enables gasless transactions through three core contracts:

1. **RelayerHub** - Central registry managing approved relayers and system configuration
2. **PaymasterFactory** - Deploys Paymaster instances using minimal proxy pattern (EIP-1167)
3. **Paymaster** - Sponsors and executes meta-transactions on behalf of users

**Key Features:**
- ✅ EIP-712 signature-based meta-transactions
- ✅ Spending limits (per-transaction, daily, monthly, global)
- ✅ Whitelist-based access control
- ✅ Low balance alerts for developers
- ✅ Analytics tracking (transactions, gas, unique users)
- ✅ Emergency pause functionality
- ✅ UUPS upgradeability for RelayerHub and Factory

---

## 🚀 Deployed Contracts

### Mantle Sepolia Testnet (Chain ID: 5003)

| Contract | Address | Explorer |
|----------|---------|----------|
| **RelayerHub (Proxy)** | [`0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737`](https://explorer.sepolia.mantle.xyz/address/0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737) | [View](https://explorer.sepolia.mantle.xyz/address/0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737) |
| RelayerHub Implementation | `0xfd2f67cD354545712f9d8230170015d7e30d133A` | [View](https://explorer.sepolia.mantle.xyz/address/0xfd2f67cD354545712f9d8230170015d7e30d133A) |
| **PaymasterFactory (Proxy)** | [`0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4`](https://explorer.sepolia.mantle.xyz/address/0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4) | [View](https://explorer.sepolia.mantle.xyz/address/0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4) |
| PaymasterFactory Implementation | `0x2d18B34880cc67DA1358f8963906492e0d01a567` | [View](https://explorer.sepolia.mantle.xyz/address/0x2d18B34880cc67DA1358f8963906492e0d01a567) |
| **Paymaster Implementation** | `0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5` | [View](https://explorer.sepolia.mantle.xyz/address/0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5) |

**Network Configuration:**
- **RPC URL:** `https://rpc.sepolia.mantle.xyz`
- **Chain ID:** `5003`
- **Currency:** MNT
- **Block Explorer:** https://explorer.sepolia.mantle.xyz

---

## 🏗️ Architecture

### System Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  Paymaster  │
│   (User)    │         │  (Relayer)   │         │  (Proxy)    │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │ 1. Sign meta-tx       │                         │
      │    (EIP-712)          │                         │
      │                        │                         │
      │◀───────────────────────│                         │
      │                        │                         │
      │ 2. Send signature      │                         │
      │───────────────────────▶│                         │
                               │                         │
                               │ 3. Execute meta-tx      │
                               │────────────────────────▶│
                               │                         │
                               │◀────────────────────────│
                               │    4. Reimburse gas     │
                               │                         │
                               │                         ▼
                               │                   ┌──────────┐
                               │                   │  Target  │
                               │                   │ Contract │
                               │                   └──────────┘
```

### Proxy Pattern

All Paymasters are **minimal proxies (EIP-1167)** pointing to a shared implementation:

```
Developer calls Factory.createPaymaster()
           │
           ▼
   ┌──────────────────┐
   │ PaymasterFactory │
   │    (Proxy)       │
   └──────────────────┘
           │
           │ Creates minimal proxy
           ▼
   ┌──────────────────┐
   │   Paymaster      │──────▶ Points to implementation
   │   (Proxy #1)     │        (0xc97C6656...)
   └──────────────────┘
           
   ┌──────────────────┐
   │   Paymaster      │──────▶ Same implementation
   │   (Proxy #2)     │        (0xc97C6656...)
   └──────────────────┘
```

**Benefits:**
- 80% cheaper deployment (~100k gas vs 500k gas)
- All Paymasters share the same logic
- Each Paymaster has isolated storage
- Implementation can be upgraded via factory

---

## 📚 Contract Functions

### RelayerHub (0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737)

**Relayer Management:**
```solidity
function addRelayer(address relayer) external onlyOwner
function removeRelayer(address relayer) external onlyOwner
function isApprovedRelayer(address relayer) external view returns (bool)
function getApprovedRelayers() external view returns (address[] memory)
```

**Factory Management:**
```solidity
function setPaymasterFactory(address factory) external onlyOwner
function getPaymasterFactory() external view returns (address)
```

**System Configuration:**
```solidity
function setMaxGasLimit(uint256 limit) external onlyOwner
function setMinPaymasterBalance(uint256 balance) external onlyOwner
function setPlatformFee(uint256 feePercentage, address feeRecipient, bool enabled) external onlyOwner
```

### PaymasterFactory (0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4)

**Paymaster Deployment:**
```solidity
function createPaymaster() external payable returns (address)
function createPaymasterWithConfig(
    uint256 initialDeposit,
    address[] calldata whitelistedContracts,
    address[] calldata targets,
    bytes4[] calldata selectors,
    uint256 perTxLimit,
    uint256 dailyLimit,
    uint256 monthlyLimit
) external payable returns (address)
```

**Registry Queries:**
```solidity
function getPaymasters(address owner) external view returns (address[] memory)
function getAllPaymasters() external view returns (address[] memory)
function getTotalPaymasters() external view returns (uint256)
function isPaymaster(address addr) external view returns (bool)
```

**Implementation Management:**
```solidity
function updateImplementation(address newImpl, string memory version, string memory description) external onlyOwner
function getCurrentImplementation() external view returns (address, string memory, uint256)
function getImplementationHistory() external view returns (ImplementationVersion[] memory)
```

### Paymaster (Individual Instances)

**Core Transaction Execution:**
```solidity
function executeMetaTransaction(
    address user,
    address target,
    bytes calldata data,
    uint256 gasLimit,
    uint256 nonce,
    uint256 deadline,
    bytes calldata signature
) external onlyRelayer whenNotPaused nonReentrant returns (bool, bytes memory)
```

**Pre-Flight Validation:**
```solidity
function canExecuteMetaTransaction(
    address user,
    address target,
    bytes calldata data,
    uint256 gasLimit,
    uint256 nonce,
    uint256 deadline
) external view returns (bool, uint256, string memory)
```

**Gas Estimation:**
```solidity
function estimateTransactionCost(
    address target,
    bytes calldata data,
    uint256 gasLimit
) external view returns (uint256 estimatedGas, uint256 estimatedCost)
```

**Balance Management:**
```solidity
function deposit() external payable onlyOwner
function withdraw(uint256 amount) external onlyOwner nonReentrant
function withdrawAll() external onlyOwner nonReentrant
function getBalance() external view returns (uint256)
```

**Whitelist Management:**
```solidity
function addWhitelistedContract(address contractAddr) external onlyOwner
function removeWhitelistedContract(address contractAddr) external onlyOwner
function addWhitelistedFunction(address contractAddr, bytes4 selector) external onlyOwner
function removeWhitelistedFunction(address contractAddr, bytes4 selector) external onlyOwner
function batchAddWhitelistedFunctions(address contractAddr, bytes4[] calldata selectors) external onlyOwner
function batchAddWhitelistedContractsWithFunctions(address[] calldata contracts, bytes4[][] calldata selectors) external onlyOwner
```

**Spending Limits:**
```solidity
function setPerTransactionLimit(uint256 limit) external onlyOwner
function setDailyLimit(uint256 limit) external onlyOwner
function setMonthlyLimit(uint256 limit) external onlyOwner
function setGlobalLimit(uint256 limit) external onlyOwner
function getRemainingDailyLimit() external view returns (uint256)
function getRemainingMonthlyLimit() external view returns (uint256)
function getRemainingGlobalLimit() external view returns (uint256)
```

**Analytics:**
```solidity
function getAnalytics() external view returns (
    uint256 totalTransactions,
    uint256 totalGasSpent,
    uint256 uniqueUsers,
    uint256 totalValueTransferred
)
```

**Emergency Controls:**
```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
function setLowBalanceThreshold(uint256 threshold) external onlyOwner
```

**View Functions:**
```solidity
function nonces(address user) external view returns (uint256)
function DOMAIN_SEPARATOR() external view returns (bytes32)
function isContractWhitelisted(address contractAddr) external view returns (bool)
function isFunctionWhitelisted(address contractAddr, bytes4 selector) external view returns (bool)
```

---

## 🔌 Integration Guide

### Backend (Relayer Service) Integration

The backend acts as the **relayer** - it receives signed meta-transactions from users and submits them to Paymasters.

**Prerequisites:**
```bash
npm install ethers@6 dotenv
```

**Environment Setup:**
```env
# .env
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
RELAYER_PRIVATE_KEY=0x...
RELAYER_HUB_ADDRESS=0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737
PAYMASTER_FACTORY_ADDRESS=0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
```

**Backend Implementation:**

```javascript
// backend/relayer-service.js
const { ethers } = require('ethers');

class RelayerService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL);
    this.relayerWallet = new ethers.Wallet(
      process.env.RELAYER_PRIVATE_KEY,
      this.provider
    );
    
    // Load contract ABIs
    this.paymasterABI = require('./abis/Paymaster.json');
    this.factoryABI = require('./abis/PaymasterFactory.json');
  }

  // Execute meta-transaction
  async executeMetaTransaction(paymasterAddress, metaTx) {
    const paymaster = new ethers.Contract(
      paymasterAddress,
      this.paymasterABI,
      this.relayerWallet
    );

    // Pre-flight check
    const [canExecute, errorCode, reason] = await paymaster.canExecuteMetaTransaction(
      metaTx.user,
      metaTx.target,
      metaTx.data,
      metaTx.gasLimit,
      metaTx.nonce,
      metaTx.deadline
    );

    if (!canExecute) {
      throw new Error(`Cannot execute: ${reason} (code: ${errorCode})`);
    }

    // Execute transaction
    const tx = await paymaster.executeMetaTransaction(
      metaTx.user,
      metaTx.target,
      metaTx.data,
      metaTx.gasLimit,
      metaTx.nonce,
      metaTx.deadline,
      metaTx.signature
    );

    const receipt = await tx.wait();
    return {
      success: receipt.status === 1,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  // Get all Paymasters for monitoring
  async getAllPaymasters() {
    const factory = new ethers.Contract(
      process.env.PAYMASTER_FACTORY_ADDRESS,
      this.factoryABI,
      this.provider
    );
    
    return await factory.getAllPaymasters();
  }
}

// Express API endpoint
const express = require('express');
const app = express();
app.use(express.json());

const relayer = new RelayerService();

app.post('/api/relay', async (req, res) => {
  try {
    const { paymasterAddress, metaTx } = req.body;
    
    // Validate request
    if (!ethers.isAddress(paymasterAddress)) {
      return res.status(400).json({ error: 'Invalid paymaster address' });
    }

    const result = await relayer.executeMetaTransaction(paymasterAddress, metaTx);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Relayer service running on port 3000'));
```

### Frontend Integration

The frontend allows users to sign meta-transactions without needing MNT for gas.

```javascript
// frontend/gasless-transaction.js
import { ethers } from 'ethers';

class GaslessTransaction {
  constructor(paymasterAddress, provider) {
    this.paymasterAddress = paymasterAddress;
    this.provider = provider;
    this.paymasterABI = require('./abis/Paymaster.json');
  }

  // Sign meta-transaction (EIP-712)
  async signMetaTransaction(signer, target, data, gasLimit) {
    const paymaster = new ethers.Contract(
      this.paymasterAddress,
      this.paymasterABI,
      this.provider
    );

    const userAddress = await signer.getAddress();
    const nonce = await paymaster.nonces(userAddress);
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // EIP-712 Domain
    const domain = {
      name: 'Paymaster',
      version: '1',
      chainId: (await this.provider.getNetwork()).chainId,
      verifyingContract: this.paymasterAddress
    };

    // EIP-712 Types
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

    // Values
    const value = {
      user: userAddress,
      target: target,
      data: data,
      gasLimit: gasLimit,
      nonce: nonce,
      deadline: deadline
    };

    // Sign
    const signature = await signer.signTypedData(domain, types, value);

    return {
      user: userAddress,
      target: target,
      data: data,
      gasLimit: gasLimit,
      nonce: nonce.toString(),
      deadline: deadline,
      signature: signature
    };
  }

  // Send to backend relayer
  async executeGasless(signer, target, data, gasLimit) {
    const metaTx = await this.signMetaTransaction(signer, target, data, gasLimit);

    const response = await fetch('http://your-backend-url.com/api/relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymasterAddress: this.paymasterAddress,
        metaTx: metaTx
      })
    });

    return await response.json();
  }
}

// Usage in React/Vue component
async function handleGaslessTransaction() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const gasless = new GaslessTransaction(
    '0x...', // Paymaster address
    provider
  );

  // Example: Call a function on a target contract
  const targetContract = '0x...';
  const targetInterface = new ethers.Interface(['function someFunction(uint256 value)']);
  const data = targetInterface.encodeFunctionData('someFunction', [123]);

  const result = await gasless.executeGasless(
    signer,
    targetContract,
    data,
    300000 // gas limit
  );

  console.log('Transaction hash:', result.txHash);
}
```

---

## 🛠️ SDK Implementation

The SDK provides a simple interface for developers to integrate gasless transactions.

**SDK Structure:**
```
mantle-gasless-sdk/
├── src/
│   ├── RelayerHub.ts      # RelayerHub interactions
│   ├── PaymasterFactory.ts # Deploy Paymasters
│   ├── Paymaster.ts        # Paymaster operations
│   ├── MetaTransaction.ts  # EIP-712 signing
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Main export
├── abis/                   # Contract ABIs
└── package.json
```

**SDK Implementation (TypeScript):**

```typescript
// sdk/src/index.ts
import { ethers, Signer } from 'ethers';

export class MantleGaslessSDK {
  private provider: ethers.Provider;
  private relayerHubAddress: string;
  private factoryAddress: string;

  constructor(
    provider: ethers.Provider,
    relayerHubAddress: string,
    factoryAddress: string
  ) {
    this.provider = provider;
    this.relayerHubAddress = relayerHubAddress;
    this.factoryAddress = factoryAddress;
  }

  // Create a new Paymaster
  async createPaymaster(developerSigner: Signer): Promise<string> {
    const factory = new ethers.Contract(
      this.factoryAddress,
      PaymasterFactoryABI,
      developerSigner
    );

    const tx = await factory.createPaymaster();
    const receipt = await tx.wait();
    
    // Parse event to get Paymaster address
    const event = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id('PaymasterCreated(address,address,uint256,uint256)')
    );
    
    const paymasterAddress = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'address', 'uint256', 'uint256'],
      event.data
    )[1];

    return paymasterAddress;
  }

  // Get Paymaster instance
  getPaymaster(address: string, signer?: Signer): Paymaster {
    return new Paymaster(address, this.provider, signer);
  }
}

export class Paymaster {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  public address: string;

  constructor(address: string, provider: ethers.Provider, signer?: Signer) {
    this.address = address;
    this.provider = provider;
    this.contract = new ethers.Contract(
      address,
      PaymasterABI,
      signer || provider
    );
  }

  // Sign and prepare meta-transaction
  async prepareMetaTransaction(
    userSigner: Signer,
    target: string,
    data: string,
    gasLimit: number
  ): Promise<MetaTransaction> {
    const userAddress = await userSigner.getAddress();
    const nonce = await this.contract.nonces(userAddress);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const domain = {
      name: 'Paymaster',
      version: '1',
      chainId: (await this.provider.getNetwork()).chainId,
      verifyingContract: this.address
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
      user: userAddress,
      target,
      data,
      gasLimit,
      nonce,
      deadline
    };

    const signature = await userSigner.signTypedData(domain, types, value);

    return { ...value, signature, nonce: nonce.toString() };
  }

  // Execute via relayer
  async execute(relayerSigner: Signer, metaTx: MetaTransaction) {
    const contract = this.contract.connect(relayerSigner);
    
    const tx = await contract.executeMetaTransaction(
      metaTx.user,
      metaTx.target,
      metaTx.data,
      metaTx.gasLimit,
      metaTx.nonce,
      metaTx.deadline,
      metaTx.signature
    );

    return await tx.wait();
  }

  // Deposit funds
  async deposit(amount: bigint, signer: Signer) {
    const contract = this.contract.connect(signer);
    const tx = await contract.deposit({ value: amount });
    return await tx.wait();
  }

  // Whitelist contract
  async addWhitelistedContract(contractAddress: string, signer: Signer) {
    const contract = this.contract.connect(signer);
    const tx = await contract.addWhitelistedContract(contractAddress);
    return await tx.wait();
  }

  // Get analytics
  async getAnalytics() {
    return await this.contract.getAnalytics();
  }
}

// Export types
export interface MetaTransaction {
  user: string;
  target: string;
  data: string;
  gasLimit: number;
  nonce: string;
  deadline: number;
  signature: string;
}
```

**SDK Usage Example:**

```typescript
// Developer deploys and configures Paymaster
import { MantleGaslessSDK } from 'mantle-gasless-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
const developerWallet = new ethers.Wallet(process.env.DEVELOPER_KEY, provider);

const sdk = new MantleGaslessSDK(
  provider,
  '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737', // RelayerHub
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'  // Factory
);

// Deploy Paymaster
const paymasterAddress = await sdk.createPaymaster(developerWallet);
console.log('Paymaster deployed:', paymasterAddress);

// Configure it
const paymaster = sdk.getPaymaster(paymasterAddress, developerWallet);
await paymaster.deposit(ethers.parseEther('1.0'), developerWallet);
await paymaster.addWhitelistedContract('0x...', developerWallet);

// User signs transaction
const userWallet = new ethers.Wallet(process.env.USER_KEY);
const metaTx = await paymaster.prepareMetaTransaction(
  userWallet,
  '0x...', // target contract
  '0x...', // encoded function call
  300000   // gas limit
);

// Send to backend relayer
fetch('http://backend/api/relay', {
  method: 'POST',
  body: JSON.stringify({ paymasterAddress, metaTx })
});
```

---

## 💻 Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js v18+ (for SDK)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mantle-relayer/smart-contract

# Install dependencies
forge install

# Copy environment file
cp .env.example .env
```

### Build

```bash
forge build
```

### Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_ExecuteMetaTransaction_Success

# Gas report
forge test --gas-report
```

### Deploy

```bash
# Deploy to Mantle Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MANTLE_TESTNET_RPC_URL \
  --broadcast \
  --verify

# Deploy to local Anvil
anvil # in separate terminal
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast
```

### Verify Contracts

```bash
forge verify-contract <ADDRESS> src/core/RelayerHub.sol:RelayerHub --chain-id 5003
forge verify-contract <ADDRESS> src/core/Paymaster.sol:Paymaster --chain-id 5003
forge verify-contract <ADDRESS> src/core/PaymasterFactory.sol:PaymasterFactory --chain-id 5003
```

---

## 🧪 Testing

**Test Coverage: 99.3% (147/148 tests passing)**

### Test Structure

```
test/
├── unit/
│   ├── RelayerHub.t.sol          # 30+ tests
│   ├── PaymasterFactory.t.sol    # 35+ tests
│   └── Paymaster.t.sol            # 70+ tests
├── integration/
│   ├── EndToEnd.t.sol             # 6 integration tests
│   └── SpendingLimits.t.sol      # 5 complex scenarios
└── mocks/
    ├── MockERC20.sol
    ├── MockTarget.sol
    └── MockRelayerHub.sol
```

### Run Tests

```bash
# All tests
forge test

# Specific test file
forge test --match-path test/unit/Paymaster.t.sol

# Specific test function
forge test --match-test test_ExecuteMetaTransaction_Success

# With gas reporting
forge test --gas-report

# Integration tests only
forge test --match-path "test/integration/*.sol"
```

---

## 📖 Additional Resources

- **Architecture Document:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Specification:** [spec_1_mantle_gas_less_relayer.md](../spec_1_mantle_gas_less_relayer.md)
- **Implementation Guide:** [PHASE_1_IMPLEMENTATION_GUIDE.md](../PHASE_1_IMPLEMENTATION_GUIDE.md)
- **Mantle Documentation:** https://docs.mantle.xyz
- **Block Explorer:** https://explorer.sepolia.mantle.xyz

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

## ⚠️ Security

This is experimental software. Use at your own risk. Not audited yet.

**Security Features:**
- EIP-712 signature verification
- Nonce-based replay protection
- Deadline-based expiry protection
- Reentrancy guards
- Spending limits
- Whitelist access control
- Emergency pause mechanism

---

## 📞 Support

For questions or support, please open an issue on GitHub.
