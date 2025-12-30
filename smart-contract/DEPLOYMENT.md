# Deployment Information - Mantle Sepolia Testnet

## 📋 Deployment Summary

**Network:** Mantle Sepolia Testnet  
**Chain ID:** 5003  
**Deployment Date:** December 30, 2025  
**Deployer Address:** `0x9bcf302cFCB64406b557342c2715e85Ac62A4693`  
**Total Gas Cost:** 0.38 MNT  

---

## 🚀 Deployed Contract Addresses

### Production Addresses (Use These)

| Contract | Address | Purpose |
|----------|---------|---------|
| **RelayerHub (Proxy)** | `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737` | Central registry for relayers and system config |
| **PaymasterFactory (Proxy)** | `0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4` | Deploy new Paymaster instances |
| **Paymaster Implementation** | `0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5` | Shared logic for all Paymasters |

### Implementation Addresses (Reference Only)

| Contract | Address | Notes |
|----------|---------|-------|
| RelayerHub Implementation | `0xfd2f67cD354545712f9d8230170015d7e30d133A` | Logic contract for RelayerHub proxy |
| Factory Implementation | `0x2d18B34880cc67DA1358f8963906492e0d01a567` | Logic contract for Factory proxy |

---

## 🔗 Block Explorer Links

- **RelayerHub:** https://explorer.sepolia.mantle.xyz/address/0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737
- **PaymasterFactory:** https://explorer.sepolia.mantle.xyz/address/0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4
- **Paymaster Implementation:** https://explorer.sepolia.mantle.xyz/address/0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5

---

## 📝 Contract ABIs

ABIs are located in the following directories after compilation:
```
out/RelayerHub.sol/RelayerHub.json
out/PaymasterFactory.sol/PaymasterFactory.json
out/Paymaster.sol/Paymaster.json
```

---

## 🔧 Quick Start for Developers

### Backend Integration

```javascript
// Environment variables
const RELAYER_HUB = '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737';
const FACTORY = '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4';
const RPC_URL = 'https://rpc.sepolia.mantle.xyz';
const CHAIN_ID = 5003;
```

### Frontend Integration

```javascript
// Add to your Web3 config
const mantleSepolia = {
  chainId: 5003,
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorer: 'https://explorer.sepolia.mantle.xyz',
  contracts: {
    relayerHub: '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737',
    factory: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'
  }
};
```

### SDK Configuration

```typescript
import { MantleGaslessSDK } from 'mantle-gasless-sdk';

const sdk = new MantleGaslessSDK(
  provider,
  '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737', // RelayerHub
  '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4'  // Factory
);
```

---

## 🎯 Next Steps

### For Backend Developers:
1. ✅ Use the contract addresses above
2. ✅ Load ABIs from `out/` directory
3. ✅ Set up relayer wallet with testnet MNT
4. ✅ Call `RelayerHub.addRelayer()` to register your relayer
5. ✅ Implement meta-transaction execution endpoint

### For Frontend Developers:
1. ✅ Use Factory address to create Paymasters
2. ✅ Implement EIP-712 signature generation
3. ✅ Send signed transactions to backend relayer
4. ✅ Display transaction status and history

### For SDK Developers:
1. ✅ Package contract ABIs
2. ✅ Implement helper functions for EIP-712 signing
3. ✅ Create wrapper classes for each contract
4. ✅ Add TypeScript types
5. ✅ Publish to npm

---

## 📊 Current System Status

- **RelayerHub Owner:** `0x9bcf302cFCB64406b557342c2715e85Ac62A4693`
- **Max Gas Limit:** 10,000,000
- **Min Paymaster Balance:** 0.1 MNT
- **Approved Relayers:** 0 (add via `RelayerHub.addRelayer()`)
- **Total Paymasters Deployed:** 0 (deploy via `Factory.createPaymaster()`)

---

## 🔒 Security Notes

- All contracts are verified on block explorer
- Contracts use OpenZeppelin's secure implementations
- UUPS upgradeable pattern for RelayerHub and Factory
- EIP-712 signatures for meta-transaction security
- Nonce-based replay protection
- Deadline-based expiry protection

---

## 📞 Support

For questions or issues:
- Check [README.md](./README.md) for detailed documentation
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Open an issue on GitHub

---

**Deployment Status:** ✅ LIVE on Mantle Sepolia Testnet
