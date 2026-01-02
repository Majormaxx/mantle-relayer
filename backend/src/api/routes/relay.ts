import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { transactionService } from '../../services/transactionService.js';
import { relayRequestSchema, validateRequestSchema } from '../../types/requests.js';
import type { SignedMetaTransaction } from '../../types/contracts.js';
import { TransactionStatus } from '../../types/contracts.js';
import type { RelayResponse, ValidateResponse, ApiResponse } from '../../types/responses.js';
import { ValidationError, RelayerError } from '../../utils/errors.js';

/**
 * Register relay transaction routes.
 */
export async function relayRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/relay
   * Submit a signed meta-transaction for execution.
   */
  app.post('/api/v1/relay', async (request: FastifyRequest, reply: FastifyReply) => {
    // Validate request body
    const parseResult = relayRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError('Invalid request body', details);
    }

    const { paymasterAddress, metaTx } = parseResult.data;

    // Convert string values to proper types
    const signedMetaTx: SignedMetaTransaction = {
      user: metaTx.user,
      target: metaTx.target,
      data: metaTx.data,
      gasLimit: BigInt(metaTx.gasLimit),
      nonce: BigInt(metaTx.nonce),
      deadline: BigInt(metaTx.deadline),
      signature: metaTx.signature,
    };

    // Execute the relay
    const result = await transactionService.relay(paymasterAddress, signedMetaTx);

    const response: ApiResponse<RelayResponse> = {
      success: true,
      data: {
        txHash: result.txHash,
        status: result.success ? TransactionStatus.CONFIRMED : TransactionStatus.REVERTED,
        gasUsed: result.gasUsed.toString(),
        effectiveGasPrice: result.effectiveGasPrice.toString(),
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    return reply.status(200).send(response);
  });

  /**
   * POST /api/v1/validate
   * Validate a meta-transaction without executing (dry run).
   */
  app.post('/api/v1/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    // Validate request body
    const parseResult = validateRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError('Invalid request body', details);
    }

    const { paymasterAddress, metaTx } = parseResult.data;

    // For validation, we need a dummy signature if not provided
    const signedMetaTx: SignedMetaTransaction = {
      user: metaTx.user,
      target: metaTx.target,
      data: metaTx.data,
      gasLimit: BigInt(metaTx.gasLimit),
      nonce: BigInt(metaTx.nonce),
      deadline: BigInt(metaTx.deadline),
      signature: '0x' + '00'.repeat(65), // Dummy signature for validation
    };

    try {
      const result = await transactionService.validate(paymasterAddress, signedMetaTx);

      // Get estimated cost
      const costEstimate = await transactionService.estimateCost(
        paymasterAddress,
        metaTx.target,
        metaTx.data,
        BigInt(metaTx.gasLimit)
      );

      const response: ApiResponse<ValidateResponse> = {
        success: true,
        data: {
          canExecute: result.canExecute,
          errorCode: result.errorCode,
          reason: result.reason,
          estimatedGas: costEstimate.estimatedGas.toString(),
          estimatedCost: costEstimate.estimatedCostWei.toString(),
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      };

      return reply.status(200).send(response);
    } catch (error) {
      if (error instanceof RelayerError) {
        const response: ApiResponse<ValidateResponse> = {
          success: true,
          data: {
            canExecute: false,
            errorCode: -1,
            reason: error.message,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        };
        return reply.status(200).send(response);
      }
      throw error;
    }
  });

  /**
   * GET /api/v1/transaction/:txHash
   * Get transaction status by hash.
   */
  app.get(
    '/api/v1/transaction/:txHash',
    async (
      request: FastifyRequest<{ Params: { txHash: string } }>,
      reply: FastifyReply
    ) => {
      const { txHash } = request.params;

      // Validate hash format
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        throw new ValidationError('Invalid transaction hash format');
      }

      const record = transactionService.getTransactionByHash(txHash);

      if (!record) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      }

      return reply.status(200).send({
        success: true,
        data: {
          txHash: record.txHash,
          status: record.status,
          gasUsed: record.gasUsed?.toString(),
          error: record.error,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  );
}
