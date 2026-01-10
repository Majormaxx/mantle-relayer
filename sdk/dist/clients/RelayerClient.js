/**
 * Client for communicating with the relayer backend API
 */
export class RelayerClient {
    constructor(baseUrl, timeout = 30000) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.timeout = timeout;
    }
    /**
     * Check if relayer backend is healthy
     */
    async health() {
        try {
            const response = await this.fetch('/health');
            const data = await response.json();
            return data.status === 'ok';
        }
        catch {
            return false;
        }
    }
    /**
     * Submit a signed meta-transaction for execution
     */
    async relay(paymasterAddress, signedMetaTx) {
        const response = await this.fetch('/api/v1/relay', {
            method: 'POST',
            body: JSON.stringify({
                paymasterAddress,
                metaTx: this.serializeMetaTx(signedMetaTx),
            }),
        });
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error?.message || 'Relay failed');
        }
        return {
            txHash: result.data.txHash,
            status: result.data.status,
            gasUsed: result.data.gasUsed ? BigInt(result.data.gasUsed) : undefined,
            effectiveGasPrice: result.data.effectiveGasPrice
                ? BigInt(result.data.effectiveGasPrice)
                : undefined,
        };
    }
    /**
     * Validate a meta-transaction without executing (dry run)
     */
    async validate(paymasterAddress, metaTx) {
        const response = await this.fetch('/api/v1/validate', {
            method: 'POST',
            body: JSON.stringify({
                paymasterAddress,
                metaTx: this.serializeMetaTx(metaTx),
            }),
        });
        const result = await response.json();
        return {
            canExecute: result.data.canExecute,
            errorCode: result.data.errorCode,
            reason: result.data.reason,
            estimatedGas: result.data.estimatedGas
                ? BigInt(result.data.estimatedGas)
                : undefined,
            estimatedCost: result.data.estimatedCost
                ? BigInt(result.data.estimatedCost)
                : undefined,
        };
    }
    /**
     * Get Paymaster information
     */
    async getPaymasterInfo(address) {
        const response = await this.fetch(`/api/v1/paymaster/${address}`);
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error?.message || 'Failed to get Paymaster info');
        }
        return this.deserializePaymasterInfo(result.data);
    }
    /**
     * Get user's nonce for a Paymaster
     */
    async getUserNonce(paymasterAddress, userAddress) {
        const response = await this.fetch(`/api/v1/paymaster/${paymasterAddress}/nonce/${userAddress}`);
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error?.message || 'Failed to get nonce');
        }
        return BigInt(result.data.nonce);
    }
    /**
     * Get transaction status
     */
    async getTransactionStatus(txHash) {
        const response = await this.fetch(`/api/v1/transaction/${txHash}`);
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error?.message || 'Transaction not found');
        }
        return {
            txHash: result.data.txHash,
            status: result.data.status,
            gasUsed: result.data.gasUsed ? BigInt(result.data.gasUsed) : undefined,
        };
    }
    /**
     * Internal fetch wrapper with timeout and error handling
     */
    async fetch(path, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }
            return response;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    /**
     * Serialize meta-transaction for API (convert bigints to strings)
     */
    serializeMetaTx(metaTx) {
        return {
            ...metaTx,
            gasLimit: metaTx.gasLimit.toString(),
            nonce: metaTx.nonce.toString(),
            deadline: metaTx.deadline.toString(),
        };
    }
    /**
     * Deserialize Paymaster info from API response
     */
    deserializePaymasterInfo(data) {
        return {
            address: data.address,
            owner: data.owner,
            balance: BigInt(data.balance),
            isLowBalance: data.isLowBalance,
            isPaused: data.isPaused,
            whitelistedContracts: data.whitelistedContracts,
            spendingLimits: {
                perTransactionLimit: this.parseLimitValue(data.spendingLimits.perTransactionLimit),
                dailyLimit: this.parseLimitValue(data.spendingLimits.dailyLimit),
                monthlyLimit: this.parseLimitValue(data.spendingLimits.monthlyLimit),
                globalLimit: this.parseLimitValue(data.spendingLimits.globalLimit),
                dailySpent: BigInt(data.spendingLimits.dailySpent),
                monthlySpent: BigInt(data.spendingLimits.monthlySpent),
                globalSpent: BigInt(data.spendingLimits.globalSpent),
                lastResetDay: BigInt(0), // Not returned by API
                lastResetMonth: BigInt(0), // Not returned by API
            },
            analytics: {
                totalTransactions: BigInt(data.analytics.totalTransactions),
                totalGasSpent: BigInt(data.analytics.totalGasSpent),
                uniqueUsers: BigInt(data.analytics.uniqueUsers),
            },
        };
    }
    /**
     * Parse limit value (handle "unlimited" string)
     */
    parseLimitValue(value) {
        return value === 'unlimited' ? 0n : BigInt(value);
    }
}
