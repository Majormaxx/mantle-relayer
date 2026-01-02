import pino from 'pino';
import { server as serverConfig } from '../config/index.js';

/**
 * Structured logger with request correlation support.
 * Uses Pino for high-performance JSON logging.
 */
export const logger = pino(
  serverConfig.isProduction
    ? {
        level: serverConfig.logLevel,
        formatters: {
          level: (label) => ({ level: label }),
        },
        base: {
          service: 'mantle-relayer',
          env: 'production',
        },
      }
    : {
        level: serverConfig.logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
        formatters: {
          level: (label) => ({ level: label }),
        },
        base: {
          service: 'mantle-relayer',
          env: 'development',
        },
      }
);

/**
 * Create a child logger with additional context.
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Create a logger for a specific request.
 */
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

export type Logger = typeof logger;
