import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { server as serverConfig, rateLimit as rateLimitConfig } from '../config/index.js';
import { logger } from '../monitoring/logger.js';
import { registerRoutes } from './routes/index.js';
import { randomUUID } from 'crypto';

/**
 * Create and configure Fastify server.
 */
export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // We use our own logger
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    trustProxy: true,
  });

  // Register plugins
  await app.register(cors, {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(sensible);

  // Rate limiting
  await app.register(rateLimit, {
    max: rateLimitConfig.maxPerMinute,
    timeWindow: '1 minute',
    keyGenerator: (request: FastifyRequest) => {
      // Use IP address as key
      return request.ip;
    },
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Retry after ${Math.ceil(context.ttl / 1000)} seconds.`,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    }),
  });

  // Request logging hook
  app.addHook('onRequest', async (request) => {
    const requestLogger = logger.child({ 
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
    (request as FastifyRequest & { requestLogger: typeof logger }).requestLogger = requestLogger;
    requestLogger.info('Request received');
  });

  // Response logging hook
  app.addHook('onResponse', async (request, reply) => {
    const req = request as FastifyRequest & { requestLogger: typeof logger };
    if (req.requestLogger) {
      req.requestLogger.info(
        { statusCode: reply.statusCode, responseTime: reply.elapsedTime },
        'Request completed'
      );
    }
  });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    const req = request as FastifyRequest & { requestLogger: typeof logger };
    const errorLogger = req.requestLogger || logger;
    errorLogger.error({ error: error.message, stack: error.stack }, 'Request error');

    // Handle known error types
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: (error as { code?: string }).code ?? 'ERROR',
          message: error.message,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Unknown error - return 500
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: serverConfig.isProduction ? 'Internal server error' : error.message,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Register routes
  await registerRoutes(app);

  return app;
}

/**
 * Start the server.
 */
export async function startServer(app: FastifyInstance): Promise<void> {
  try {
    await app.listen({ port: serverConfig.port, host: '0.0.0.0' });
    logger.info({ port: serverConfig.port }, 'Server started');
  } catch (error) {
    logger.error({ error: String(error) }, 'Failed to start server');
    process.exit(1);
  }
}
