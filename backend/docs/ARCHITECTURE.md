# Backend Architecture

## Overview

The backend relayer service receives EIP-712 signed meta-transactions from users and submits them to Paymaster contracts on Mantle Network.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   SDK/Web   │────▶│  Backend Relayer │────▶│  Paymaster  │
│   (User)    │     │                  │     │  Contract   │
└─────────────┘     └──────────────────┘     └─────────────┘
      │                      │                       │
      │ 1. Sign EIP-712      │                       │
      │────────────────────▶ │                       │
      │                      │ 2. Validate           │
      │                      │ 3. Submit tx          │
      │                      │──────────────────────▶│
      │                      │                       │
      │◀─────────────────────│◀──────────────────────│
      │    4. Return result  │  5. Reimburse gas     │
```

## Module Structure

```
src/
├── api/                    # HTTP API layer
│   ├── server.ts           # Fastify configuration
│   └── routes/             # Route handlers
├── core/                   # Core business logic
│   ├── blockchain/         # Chain interaction
│   │   ├── provider.ts     # RPC with retry
│   │   ├── wallet.ts       # Relayer wallet
│   │   └── contracts.ts    # Contract factory
│   ├── relayer/            # Relay logic
│   │   ├── validator.ts    # Pre-flight checks
│   │   ├── executor.ts     # Tx execution
│   │   └── nonceManager.ts # Nonce tracking
│   └── signature/          # EIP-712
│       ├── eip712.ts       # Types & hashing
│       └── verifier.ts     # Signature verification
├── services/               # High-level services
│   ├── paymasterService.ts # Paymaster queries
│   └── transactionService.ts # Tx lifecycle
├── types/                  # TypeScript types
└── utils/                  # Utilities
    └── errors.ts           # Error hierarchy
```

## Request Flow

1. **Request Received** - Fastify validates JSON body with Zod
2. **Pre-flight Checks** - Validator runs all checks:
   - Signature format valid
   - Deadline not expired
   - Relayer is approved
   - Paymaster exists
   - EIP-712 signature valid
   - Contract calls `canExecuteMetaTransaction()`
3. **Nonce Acquisition** - NonceManager provides unique nonce
4. **Transaction Submission** - Executor submits to blockchain
5. **Wait for Confirmation** - Monitor transaction receipt
6. **Nonce Release** - Release nonce on success/failure
7. **Response** - Return transaction hash and status

## Key Design Decisions

### EIP-712 Signature Verification

The backend verifies signatures match the smart contract's `MetaTxLib.sol`:

```typescript
const META_TX_TYPEHASH = keccak256(
  "MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)"
);
```

### Nonce Management

Thread-safe nonce management prevents transaction collisions:
- Local nonce tracking with mutex
- Syncs from chain on startup
- Releases nonce on failure for retry

### Error Handling

Errors map to contract error codes:
- `INSUFFICIENT_BALANCE` (1)
- `CONTRACT_NOT_WHITELISTED` (2)
- `FUNCTION_NOT_WHITELISTED` (3)
- `INVALID_SIGNATURE` (4)
- etc.

## Security Measures

1. **Rate Limiting** - 100 req/min per IP
2. **Request Validation** - Zod schemas for all inputs
3. **Signature Verification** - EIP-712 before blockchain call
4. **Deadline Checks** - Reject expired transactions
5. **Audit Logging** - All requests logged with correlation ID

## Scaling Considerations

For production horizontal scaling:
1. Use Redis for transaction queue
2. Use Redis for nonce coordination
3. Add API key authentication
4. Add Prometheus metrics endpoint
