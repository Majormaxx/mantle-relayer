# Mantle Gas-Less Relayer - Backend

Production-grade backend relayer service for the Mantle Gas-Less Relayer platform.

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Basic health check |
| `GET` | `/health/ready` | Readiness probe |
| `GET` | `/health/live` | Liveness probe |
| `POST` | `/api/v1/relay` | Submit signed meta-transaction |
| `POST` | `/api/v1/validate` | Pre-flight validation |
| `GET` | `/api/v1/transaction/:txHash` | Transaction status |
| `GET` | `/api/v1/paymaster/:address` | Paymaster info |
| `GET` | `/api/v1/paymaster/:address/nonce/:user` | User nonce |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MANTLE_RPC_URL` | Mantle RPC endpoint | Yes |
| `RELAYER_PRIVATE_KEY` | Relayer wallet private key | Yes |
| `RELAYER_HUB_ADDRESS` | RelayerHub contract address | Yes |
| `PAYMASTER_FACTORY_ADDRESS` | Factory contract address | Yes |
| `PORT` | Server port (default: 3000) | No |
| `LOG_LEVEL` | Logging level (default: info) | No |

## Example: Relay Transaction

```bash
curl -X POST http://localhost:3000/api/v1/relay \
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

## License

MIT
