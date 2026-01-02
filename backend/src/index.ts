import { createServer, startServer } from './api/server.js';
import { logger } from './monitoring/logger.js';
import { getRelayerAddress } from './core/blockchain/wallet.js';
import { isRpcHealthy } from './core/blockchain/provider.js';
import { checkRelayerApproved } from './core/relayer/validator.js';

/**
 * Main entry point for the relayer backend.
 */
async function main() {
  logger.info('Starting Mantle Gas-Less Relayer Backend...');

  // Startup checks
  await runStartupChecks();

  // Create and start server
  const app = await createServer();
  await startServer(app);

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Run startup health checks.
 */
async function runStartupChecks() {
  logger.info('Running startup checks...');

  // 1. Check RPC connectivity
  const rpcHealthy = await isRpcHealthy();
  if (!rpcHealthy) {
    logger.error('RPC is not healthy - check MANTLE_RPC_URL');
    process.exit(1);
  }
  logger.info('RPC connection: OK');

  // 2. Log relayer address
  const relayerAddress = getRelayerAddress();
  logger.info({ relayerAddress }, 'Relayer wallet loaded');

  // 3. Check if relayer is approved
  const isApproved = await checkRelayerApproved();
  if (!isApproved) {
    logger.warn(
      { relayerAddress },
      'Relayer is NOT approved in RelayerHub - transactions will fail until approved'
    );
  } else {
    logger.info('Relayer approval: OK');
  }

  logger.info('Startup checks completed');
}

// Run
main().catch((error) => {
  logger.error({ error: String(error) }, 'Fatal error during startup');
  process.exit(1);
});
