/**
 * React Integration Example
 * 
 * Demonstrates how to integrate Mantle Gasless SDK in a React application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MantleGaslessSDK, PaymasterClient, GaslessTransactionResult } from '../src/index';
import { ethers } from 'ethers';

// Configuration
const SDK_CONFIG = {
  relayerUrl: 'https://relayer-sepolia.mantle-gasless.xyz',
  factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  chainId: 5003,
};

// Custom hook for SDK initialization
function useGaslessSDK() {
  const [sdk, setSDK] = useState<MantleGaslessSDK | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      
      const sdkInstance = new MantleGaslessSDK(browserProvider, SDK_CONFIG);
      setSDK(sdkInstance);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        setIsConnected(accounts.length > 0);
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setIsConnected(accounts.length > 0);
      });
    }
  }, []);

  return { sdk, provider, isConnected };
}

// Custom hook for wallet connection
function useWallet() {
  const [address, setAddress] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connect = useCallback(async (provider: ethers.BrowserProvider) => {
    if (!provider) return;

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userSigner = await provider.getSigner();
      const userAddress = await userSigner.getAddress();
      
      setSigner(userSigner);
      setAddress(userAddress);
      
      return userAddress;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress('');
    setSigner(null);
  }, []);

  return { address, signer, connect, disconnect };
}

// Main App Component
export default function GaslessTransferApp() {
  const { sdk, provider, isConnected } = useGaslessSDK();
  const { address, signer, connect, disconnect } = useWallet();
  
  const [paymasterAddress, setPaymasterAddress] = useState('0x...');
  const [tokenAddress, setTokenAddress] = useState('0x...');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!provider) {
      setError('MetaMask not detected');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await connect(provider);
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!sdk || !signer) {
      setError('SDK or wallet not initialized');
      return;
    }

    if (!recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setTxHash('');

      const paymaster = sdk.getPaymaster(paymasterAddress);
      
      // Validate first
      const validation = await paymaster.validateGasless(
        address,
        tokenAddress,
        'transfer(address,uint256)',
        [recipientAddress, ethers.parseEther(amount)]
      );

      if (!validation.canExecute) {
        throw new Error(`Validation failed: ${validation.reason}`);
      }

      // Execute gasless transaction
      const result = await paymaster.executeGasless(
        signer,
        tokenAddress,
        'transfer(address,uint256)',
        [recipientAddress, ethers.parseEther(amount)]
      );

      setTxHash(result.txHash);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>🚀 Gasless Token Transfer</h1>
      <p>Send tokens without paying gas fees on Mantle Network</p>

      {/* Wallet Connection */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        {!address ? (
          <button 
            onClick={handleConnect} 
            disabled={isLoading || !provider}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p><strong>Connected:</strong> {address.slice(0, 6)}...{address.slice(-4)}</p>
            <button 
              onClick={disconnect}
              style={{ padding: '5px 15px', fontSize: '14px', cursor: 'pointer' }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Transfer Form */}
      {address && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Paymaster Address:</label>
            <input
              type="text"
              value={paymasterAddress}
              onChange={(e) => setPaymasterAddress(e.target.value)}
              placeholder="0x..."
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Token Address:</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Recipient Address:</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Amount (tokens):</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '16px', 
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? '⏳ Processing...' : '🚀 Send (No Gas!)'}
          </button>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0 }}><strong>✅ Success!</strong></p>
          <p style={{ fontSize: '14px', wordBreak: 'break-all', margin: '5px 0 0 0' }}>
            TX: <a href={`https://sepolia.mantlescan.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              {txHash}
            </a>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#721c24' }}><strong>❌ Error:</strong> {error}</p>
        </div>
      )}

      {/* Info */}
      <div style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
        <p><strong>Note:</strong> This transaction is completely gasless for the user!</p>
        <p>The Paymaster pays the gas fees on behalf of the user.</p>
      </div>
    </div>
  );
}

// Advanced Example: Custom Hook for Gasless Transactions
export function useGaslessTransaction(paymasterAddress: string) {
  const { sdk } = useGaslessSDK();
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<GaslessTransactionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const executeGasless = useCallback(
    async (
      signer: ethers.Signer,
      targetContract: string,
      functionSignature: string,
      args: any[],
      gasLimit?: bigint
    ) => {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      setIsExecuting(true);
      setError(null);
      setResult(null);

      try {
        const paymaster = sdk.getPaymaster(paymasterAddress);
        const txResult = await paymaster.executeGasless(
          signer,
          targetContract,
          functionSignature,
          args,
          gasLimit
        );
        
        setResult(txResult);
        return txResult;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [sdk, paymasterAddress]
  );

  return {
    executeGasless,
    isExecuting,
    result,
    error,
  };
}
