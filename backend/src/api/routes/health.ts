import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isRpcHealthy } from '../../core/blockchain/provider.js';
import { getRelayerBalance, hasRelayerSufficientBalance } from '../../core/blockchain/wallet.js';
import { checkRelayerApproved } from '../../core/relayer/validator.js';
import { transactionService } from '../../services/transactionService.js';
import type { HealthResponse } from '../../types/responses.js';

// Track server start time for uptime
const startTime = Date.now();

/**
 * Register health check routes.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Basic health check.
   */
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Detailed readiness check.
   * Returns degraded/unhealthy if critical dependencies fail.
   */
  app.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    const checks = await runHealthChecks();
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!checks.rpc || !checks.relayerApproved) {
      status = 'unhealthy';
    } else if (!checks.relayerHasFunds) {
      status = 'degraded';
    }

    const response: HealthResponse = {
      status,
      version: '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks: {
        rpc: checks.rpc,
        redis: checks.redis,
        relayerBalance: checks.relayerBalance,
        relayerApproved: checks.relayerApproved,
      },
    };

    const statusCode = status === 'unhealthy' ? 503 : 200;
    return reply.status(statusCode).send({
      success: status !== 'unhealthy',
      data: response,
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Liveness probe - simple check that server is running.
   */
  app.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: { alive: true },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Stats endpoint for monitoring.
   */
  app.get('/health/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const stats = transactionService.getStats();
    const checks = await runHealthChecks();

    return reply.send({
      success: true,
      data: {
        uptime: Math.floor((Date.now() - startTime) / 1000),
        transactions: stats,
        relayerBalance: checks.relayerBalance,
        rpcHealthy: checks.rpc,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });
}

/**
 * Run all health checks.
 */
async function runHealthChecks(): Promise<{
  rpc: boolean;
  redis: boolean;
  relayerBalance: string;
  relayerHasFunds: boolean;
  relayerApproved: boolean;
}> {
  const [rpc, relayerApproved, relayerBalance, relayerHasFunds] = await Promise.all([
    isRpcHealthy().catch(() => false),
    checkRelayerApproved().catch(() => false),
    getRelayerBalance()
      .then((b) => `${(Number(b) / 1e18).toFixed(4)} MNT`)
      .catch(() => 'unknown'),
    hasRelayerSufficientBalance().catch(() => false),
  ]);

  return {
    rpc,
    redis: true, // Not using Redis in this version
    relayerBalance,
    relayerHasFunds,
    relayerApproved,
  };
}
