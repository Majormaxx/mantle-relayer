/**
 * EIP-712 domain for Paymaster contracts
 */
export function getEIP712Domain(paymasterAddress, chainId) {
    return {
        name: 'Paymaster',
        version: '1',
        chainId: BigInt(chainId),
        verifyingContract: paymasterAddress,
    };
}
/**
 * EIP-712 types for MetaTransaction
 */
export const META_TX_TYPES = {
    MetaTransaction: [
        { name: 'user', type: 'address' },
        { name: 'target', type: 'address' },
        { name: 'data', type: 'bytes' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
};
/**
 * Sign a meta-transaction with EIP-712
 */
export async function signMetaTransaction(signer, paymasterAddress, chainId, metaTx) {
    const domain = getEIP712Domain(paymasterAddress, chainId);
    const value = {
        user: metaTx.user,
        target: metaTx.target,
        data: metaTx.data,
        gasLimit: metaTx.gasLimit,
        nonce: metaTx.nonce,
        deadline: metaTx.deadline,
    };
    return await signer.signTypedData(domain, META_TX_TYPES, value);
}
/**
 * Create a deadline timestamp (current time + duration in seconds)
 */
export function createDeadline(durationSeconds = 3600) {
    return BigInt(Math.floor(Date.now() / 1000) + durationSeconds);
}
/**
 * Encode a function call for meta-transaction data
 */
export function encodeFunctionCall(contractInterface, functionName, args) {
    return contractInterface.encodeFunctionData(functionName, args);
}
