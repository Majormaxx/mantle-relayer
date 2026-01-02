import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { relayRoutes } from './relay.js';
import { paymasterRoutes } from './paymaster.js';

/**
 * Register all API routes.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check routes (no prefix)
  await app.register(healthRoutes);

  // API v1 routes
  await app.register(relayRoutes);
  await app.register(paymasterRoutes);
}
