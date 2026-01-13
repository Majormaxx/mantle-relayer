# Mantle Gas-Less Relayer - Backend

Production-grade backend relayer service for the Mantle Gas-Less Relayer platform. This service enables users to submit meta-transactions that are executed on-chain with gas fees paid by a Paymaster.

## Production URL

```
https://mantle-relayer-production.up.railway.app
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your relayer private key

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Architecture Overview

```
                     +------------------+
  User Request  ---> |  Fastify Server  |
                     +------------------+
                            |
              +-------------+-------------+
              v                           v
    +------------------+        +------------------+
    |  Relay Routes    |        | Paymaster Routes |
    +------------------+        +------------------+
              |                           |
              v                           v
    +------------------+        +------------------+
    | Transaction Svc  |        | Paymaster Svc    |
    +------------------+        +------------------+
              |                           |
              +-------------+-------------+
                            v
                  +------------------+
                  | Blockchain Layer |
                  | (ethers.js)      |
                  +------------------+
                            |
                            v
                  +------------------+
                  | Mantle Network   |
                  +------------------+
```

## API Endpoints

### Health Checks

| Method | Endpoint        | Description                                           |
| ------ | --------------- | ----------------------------------------------------- |
| `GET`  | `/health`       | Basic health check with uptime                        |
| `GET`  | `/health/ready` | Detailed readiness probe (checks RPC, relayer status) |
| `GET`  | `/health/live`  | Liveness probe (server is running)                    |
| `GET`  | `/health/stats` | Transaction stats and monitoring info                 |

### Relay Operations

| Method | Endpoint                      | Description                                  |
| ------ | ----------------------------- | -------------------------------------------- |
| `POST` | `/api/v1/relay`               | Submit signed meta-transaction for execution |
| `POST` | `/api/v1/validate`            | Pre-flight validation (dry run)              |
| `GET`  | `/api/v1/transaction/:txHash` | Get transaction status by hash               |

### Paymaster Operations

| Method | Endpoint                                         | Description                      |
| ------ | ------------------------------------------------ | -------------------------------- |
| `GET`  | `/api/v1/paymaster/:address`                     | Get comprehensive Paymaster info |
| `GET`  | `/api/v1/paymaster/:address/nonce/:user`         | Get user's current nonce         |
| `GET`  | `/api/v1/paymaster/:address/balance`             | Get Paymaster MNT balance        |
| `GET`  | `/api/v1/paymaster/:address/whitelist/:contract` | Check if contract is whitelisted |

## Environment Variables

| Variable                    | Description                   | Required |
| --------------------------- | ----------------------------- | -------- |
| `MANTLE_RPC_URL`            | Mantle RPC endpoint           | Yes      |
| `RELAYER_PRIVATE_KEY`       | Relayer wallet private key    | Yes      |
| `RELAYER_HUB_ADDRESS`       | RelayerHub contract address   | Yes      |
| `PAYMASTER_FACTORY_ADDRESS` | Factory contract address      | Yes      |
| `SUPABASE_URL`              | Supabase project URL          | Yes      |
| `SUPABASE_SERVICE_KEY`      | Supabase service role key     | Yes      |
| `PORT`                      | Server port (default: 3000)   | No       |
| `LOG_LEVEL`                 | Logging level (default: info) | No       |

## Usage Examples

### Check Service Health

```bash
curl https://mantle-relayer-production.up.railway.app/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 12345
  }
}
```

### Submit a Meta-Transaction

```bash
curl -X POST https://mantle-relayer-production.up.railway.app/api/v1/relay \
  -H "Content-Type: application/json" \
  -d '{
    "paymasterAddress": "0x...",
    "metaTx": {
      "user": "0x...",
      "target": "0x...",
      "data": "0x...",
      "gasLimit": "300000",
      "nonce": "0",
      "deadline": "1735689600",
      "signature": "0x..."
    }
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "status": "CONFIRMED",
    "gasUsed": "150000",
    "effectiveGasPrice": "50000000"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-13T00:00:00.000Z"
  }
}
```

### Validate Before Submitting

```bash
curl -X POST https://mantle-relayer-production.up.railway.app/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{
    "paymasterAddress": "0x...",
    "metaTx": {
      "user": "0x...",
      "target": "0x...",
      "data": "0x...",
      "gasLimit": "300000",
      "nonce": "0",
      "deadline": "1735689600"
    }
  }'
```

### Get User Nonce

```bash
curl https://mantle-relayer-production.up.railway.app/api/v1/paymaster/0xPAYMASTER/nonce/0xUSER
```

### Get Paymaster Info

```bash
curl https://mantle-relayer-production.up.railway.app/api/v1/paymaster/0xPAYMASTER
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [...]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm test
```

## Docker

```bash
# Build image
docker build -t mantle-relayer-backend .

# Run container
docker run -p 3000:3000 --env-file .env mantle-relayer-backend
```

## Security

- Rate limiting per IP (100 req/min)
- Request validation with Zod
- EIP-712 signature verification
- Nonce management prevents replays
- Structured audit logging

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/          # API route handlers
│   │   │   ├── health.ts    # Health check endpoints
│   │   │   ├── relay.ts     # Relay transaction endpoints
│   │   │   └── paymaster.ts # Paymaster info endpoints
│   │   └── server.ts        # Fastify server setup
│   ├── core/
│   │   ├── blockchain/      # Blockchain interactions
│   │   ├── relayer/         # Relayer execution logic
│   │   └── signature/       # EIP-712 signature handling
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── index.ts             # Entry point
├── .env.example             # Environment template
├── package.json
└── tsconfig.json
```

## License

MIT
