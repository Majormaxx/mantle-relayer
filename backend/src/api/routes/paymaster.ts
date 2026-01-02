import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { paymasterService } from '../../services/paymasterService.js';
import { addressSchema } from '../../types/requests.js';
import type { PaymasterInfoResponse, NonceResponse, ApiResponse } from '../../types/responses.js';
import { serializeSpendingLimit, serializeAnalytics } from '../../types/responses.js';
import { ValidationError, PaymasterNotFoundError } from '../../utils/errors.js';

/**
 * Register Paymaster info routes.
 */
export async function paymasterRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/paymaster/:address
   * Get comprehensive info about a Paymaster.
   */
  app.get(
    '/api/v1/paymaster/:address',
    async (
      request: FastifyRequest<{ Params: { address: string } }>,
      reply: FastifyReply
    ) => {
      const { address } = request.params;

      // Validate address format
      const parseResult = addressSchema.safeParse(address);
      if (!parseResult.success) {
        throw new ValidationError('Invalid Paymaster address format');
      }

      const info = await paymasterService.getPaymasterInfo(address);

      const response: ApiResponse<PaymasterInfoResponse> = {
        success: true,
        data: {
          address: info.address,
          owner: info.owner,
          balance: info.balance.toString(),
          isLowBalance: info.isLowBalance,
          isPaused: info.isPaused,
          whitelistedContracts: info.whitelistedContracts,
          spendingLimits: serializeSpendingLimit(info.spendingLimits),
          analytics: serializeAnalytics(info.analytics),
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/v1/paymaster/:address/nonce/:user
   * Get user's current nonce for a Paymaster.
   */
  app.get(
    '/api/v1/paymaster/:address/nonce/:user',
    async (
      request: FastifyRequest<{ Params: { address: string; user: string } }>,
      reply: FastifyReply
    ) => {
      const { address, user } = request.params;

      // Validate addresses
      if (!addressSchema.safeParse(address).success) {
        throw new ValidationError('Invalid Paymaster address format');
      }
      if (!addressSchema.safeParse(user).success) {
        throw new ValidationError('Invalid user address format');
      }

      // Check Paymaster exists
      const isValid = await paymasterService.isValidPaymaster(address);
      if (!isValid) {
        throw new PaymasterNotFoundError(address);
      }

      const nonce = await paymasterService.getUserNonce(address, user);

      const response: ApiResponse<NonceResponse> = {
        success: true,
        data: {
          nonce: nonce.toString(),
          user,
          paymaster: address,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/v1/paymaster/:address/balance
   * Get Paymaster balance.
   */
  app.get(
    '/api/v1/paymaster/:address/balance',
    async (
      request: FastifyRequest<{ Params: { address: string } }>,
      reply: FastifyReply
    ) => {
      const { address } = request.params;

      // Validate address
      if (!addressSchema.safeParse(address).success) {
        throw new ValidationError('Invalid Paymaster address format');
      }

      // Check Paymaster exists
      const isValid = await paymasterService.isValidPaymaster(address);
      if (!isValid) {
        throw new PaymasterNotFoundError(address);
      }

      const balance = await paymasterService.getBalance(address);

      return reply.status(200).send({
        success: true,
        data: {
          balance: balance.toString(),
          balanceMNT: `${(Number(balance) / 1e18).toFixed(4)} MNT`,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  );

  /**
   * GET /api/v1/paymaster/:address/whitelist/:contract
   * Check if a contract is whitelisted.
   */
  app.get(
    '/api/v1/paymaster/:address/whitelist/:contract',
    async (
      request: FastifyRequest<{ Params: { address: string; contract: string } }>,
      reply: FastifyReply
    ) => {
      const { address, contract } = request.params;

      // Validate addresses
      if (!addressSchema.safeParse(address).success) {
        throw new ValidationError('Invalid Paymaster address format');
      }
      if (!addressSchema.safeParse(contract).success) {
        throw new ValidationError('Invalid contract address format');
      }

      const isWhitelisted = await paymasterService.isContractWhitelisted(address, contract);

      return reply.status(200).send({
        success: true,
        data: {
          contract,
          isWhitelisted,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  );
}
