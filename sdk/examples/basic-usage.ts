/**
 * Basic Usage Example
 * 
 * Demonstrates simple gasless token transfer using Mantle Gas-Less Relayer SDK
 */

import { MantleGaslessSDK } from '../src/index';
import { ethers } from 'ethers';

async function main() {
  console.log('🚀 Mantle Gasless SDK - Basic Usage Example\n');

  // 1. Setup provider (can be browser or RPC)
  const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
  
  // For browser: const provider = new ethers.BrowserProvider(window.ethereum);

  // 2. Initialize SDK
  const sdk = new MantleGaslessSDK(provider, {
    relayerUrl: process.env.RELAYER_URL || 'http://localhost:3000',
    factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
    chainId: 5003, // Mantle Sepolia
  });

  console.log('✅ SDK initialized');

  // 3. Check relayer health
  const isHealthy = await sdk.isRelayerHealthy();
  console.log(`📡 Relayer health: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}\n`);

  if (!isHealthy) {
    console.error('❌ Relayer is not healthy. Exiting...');
    process.exit(1);
  }

  // 4. Get Paymaster instance
  const paymasterAddress = process.env.PAYMASTER_ADDRESS || '0xYourPaymasterAddress';
  const paymaster = sdk.getPaymaster(paymasterAddress);

  console.log('📦 Paymaster Address:', paymasterAddress);

  // 5. Get Paymaster info
  try {
    const info = await paymaster.getInfo();
    console.log('\n📊 Paymaster Information:');
    console.log('  Owner:', info.owner);
    console.log('  Balance:', ethers.formatEther(info.balance), 'MNT');
    console.log('  Is Paused:', info.isPaused);
    console.log('  Total Transactions:', info.analytics.totalTransactions.toString());
    console.log('  Total Gas Sponsored:', ethers.formatEther(info.analytics.totalGasSponsored), 'MNT');
    console.log('  Whitelisted Contracts:', info.whitelistedContracts.length);
  } catch (error) {
    console.error('❌ Failed to get Paymaster info:', error.message);
    process.exit(1);
  }

  // 6. Setup user wallet (in production, this would be from wallet connection)
  const userPrivateKey = process.env.USER_PRIVATE_KEY;
  if (!userPrivateKey) {
    console.error('\n❌ USER_PRIVATE_KEY not set in environment');
    console.log('💡 Set it with: export USER_PRIVATE_KEY=0x...');
    process.exit(1);
  }

  const userSigner = new ethers.Wallet(userPrivateKey, provider);
  const userAddress = await userSigner.getAddress();
  console.log('\n👤 User Address:', userAddress);

  // 7. Get user's nonce
  const nonce = await paymaster.getUserNonce(userAddress);
  console.log('🔢 User Nonce:', nonce.toString());

  // 8. Define transaction parameters
  const targetContract = process.env.TOKEN_ADDRESS || '0xYourTokenAddress';
  const recipientAddress = process.env.RECIPIENT_ADDRESS || '0xRecipientAddress';
  const amount = ethers.parseEther('10'); // 10 tokens

  console.log('\n📝 Transaction Details:');
  console.log('  Target Contract:', targetContract);
  console.log('  Function: transfer(address,uint256)');
  console.log('  Recipient:', recipientAddress);
  console.log('  Amount:', ethers.formatEther(amount), 'tokens');

  // 9. Validate transaction (dry run)
  console.log('\n🔍 Validating transaction...');
  try {
    const validation = await paymaster.validateGasless(
      userAddress,
      targetContract,
      'transfer(address,uint256)',
      [recipientAddress, amount]
    );

    if (!validation.canExecute) {
      console.error('❌ Validation failed:', validation.reason);
      console.log('💡 Check that:');
      console.log('   - Paymaster has sufficient balance');
      console.log('   - Target contract is whitelisted');
      console.log('   - Function is whitelisted');
      process.exit(1);
    }

    console.log('✅ Validation passed');
    console.log('  Estimated Gas:', validation.estimatedGas?.toString());
    console.log('  Estimated Cost:', validation.estimatedCost ? ethers.formatEther(validation.estimatedCost) : 'N/A', 'MNT');
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }

  // 10. Execute gasless transaction
  console.log('\n🚀 Executing gasless transaction...');
  console.log('⏳ User will sign with EIP-712 (NO GAS REQUIRED)...');

  try {
    const result = await paymaster.executeGasless(
      userSigner,
      targetContract,
      'transfer(address,uint256)',
      [recipientAddress, amount]
    );

    console.log('\n✨ Transaction Successful!');
    console.log('  Status:', result.status);
    console.log('  TX Hash:', result.txHash);
    console.log('  Block:', result.blockNumber?.toString());
    console.log('  Gas Used:', result.gasUsed?.toString());
    console.log('\n🎉 User paid ZERO gas fees!');
    console.log(`🔗 View on Explorer: https://sepolia.mantlescan.xyz/tx/${result.txHash}`);
  } catch (error) {
    console.error('\n❌ Transaction failed:', error.message);
    
    // Handle common errors
    if (error.message.includes('INSUFFICIENT_BALANCE')) {
      console.log('💡 Paymaster needs more MNT. Fund it with:');
      console.log('   await paymaster.deposit(ethers.parseEther("10"))');
    } else if (error.message.includes('CONTRACT_NOT_WHITELISTED')) {
      console.log('💡 Whitelist the contract with:');
      console.log('   await paymaster.addWhitelistedContract(targetContract)');
    } else if (error.message.includes('FUNCTION_NOT_WHITELISTED')) {
      console.log('💡 Whitelist the function with:');
      console.log('   await paymaster.addWhitelistedFunction(targetContract, "transfer(address,uint256)")');
    }
    
    process.exit(1);
  }
}

// Run the example
main()
  .then(() => {
    console.log('\n✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Example failed:', error);
    process.exit(1);
  });
