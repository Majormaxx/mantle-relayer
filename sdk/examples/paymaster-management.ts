/**
 * Paymaster Management Example
 * 
 * Demonstrates how developers can manage their Paymasters:
 * - Deploy new Paymaster
 * - Fund Paymaster
 * - Configure whitelists
 * - Monitor usage and balance
 */

import { MantleGaslessSDK } from '../src/index';
import { ethers } from 'ethers';

// Contract ABIs (minimal for example)
const FACTORY_ABI = [
  'function createPaymaster() returns (address)',
  'event PaymasterCreated(address indexed owner, address indexed paymaster)',
];

async function main() {
  console.log('🛠️  Paymaster Management Example\n');

  // 1. Setup (developer wallet)
  const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz');
  
  const developerPrivateKey = process.env.DEVELOPER_PRIVATE_KEY;
  if (!developerPrivateKey) {
    console.error('❌ DEVELOPER_PRIVATE_KEY not set');
    process.exit(1);
  }

  const developerWallet = new ethers.Wallet(developerPrivateKey, provider);
  const developerAddress = await developerWallet.getAddress();
  console.log('👨‍💻 Developer Address:', developerAddress);

  // 2. Initialize SDK
  const sdk = new MantleGaslessSDK(provider, {
    relayerUrl: process.env.RELAYER_URL || 'http://localhost:3000',
    factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
    chainId: 5003,
  });

  console.log('✅ SDK initialized\n');

  // ==========================================
  // PART 1: Deploy New Paymaster
  // ==========================================
  console.log('📦 PART 1: Deploy New Paymaster');
  console.log('=====================================\n');

  const factory = new ethers.Contract(
    '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
    FACTORY_ABI,
    developerWallet
  );

  console.log('🚀 Deploying Paymaster...');
  try {
    const tx = await factory.createPaymaster();
    console.log('⏳ Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    // Get Paymaster address from events
    const event = receipt.logs
      .map(log => {
        try {
          return factory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(e => e?.name === 'PaymasterCreated');

    if (!event) {
      throw new Error('PaymasterCreated event not found');
    }

    const paymasterAddress = event.args.paymaster;
    console.log('🎉 Paymaster deployed at:', paymasterAddress);
    console.log(`🔗 View on Explorer: https://sepolia.mantlescan.xyz/address/${paymasterAddress}\n`);

    // ==========================================
    // PART 2: Fund Paymaster
    // ==========================================
    console.log('💰 PART 2: Fund Paymaster');
    console.log('=====================================\n');

    const fundAmount = ethers.parseEther('5'); // 5 MNT
    console.log(`💸 Funding Paymaster with ${ethers.formatEther(fundAmount)} MNT...`);

    const paymaster = sdk.getPaymaster(paymasterAddress, developerWallet);
    const depositTx = await paymaster.deposit(fundAmount);
    await depositTx.wait();

    console.log('✅ Paymaster funded!');
    
    const balance = await paymaster.getBalance();
    console.log(`💰 Current Balance: ${ethers.formatEther(balance)} MNT\n`);

    // ==========================================
    // PART 3: Configure Whitelists
    // ==========================================
    console.log('⚙️  PART 3: Configure Whitelists');
    console.log('=====================================\n');

    // Example: Whitelist a token contract
    const tokenAddress = process.env.TOKEN_ADDRESS || '0x1234567890123456789012345678901234567890';
    
    console.log('📝 Adding contract to whitelist...');
    console.log('   Contract:', tokenAddress);
    
    const whitelistTx = await paymaster.addWhitelistedContract(tokenAddress);
    await whitelistTx.wait();
    console.log('✅ Contract whitelisted');

    // Whitelist specific functions
    const functions = [
      'transfer(address,uint256)',
      'approve(address,uint256)',
      'transferFrom(address,address,uint256)',
    ];

    console.log('\n📝 Adding functions to whitelist...');
    for (const func of functions) {
      console.log(`   - ${func}`);
      const funcTx = await paymaster.addWhitelistedFunction(tokenAddress, func);
      await funcTx.wait();
    }
    console.log('✅ All functions whitelisted\n');

    // ==========================================
    // PART 4: Verify Configuration
    // ==========================================
    console.log('🔍 PART 4: Verify Configuration');
    console.log('=====================================\n');

    const isContractWhitelisted = await paymaster.isContractWhitelisted(tokenAddress);
    console.log('Contract whitelisted:', isContractWhitelisted ? '✅ Yes' : '❌ No');

    for (const func of functions) {
      const selector = ethers.id(func).slice(0, 10);
      const isFunctionWhitelisted = await paymaster.isFunctionWhitelisted(tokenAddress, selector);
      console.log(`Function ${func}:`, isFunctionWhitelisted ? '✅ Yes' : '❌ No');
    }

    const isPaused = await paymaster.isPaused();
    console.log('Paymaster paused:', isPaused ? '⚠️  Yes' : '✅ No');

    const owner = await paymaster.getOwner();
    console.log('Owner:', owner === developerAddress ? '✅ Correct' : '❌ Wrong');

    // ==========================================
    // PART 5: Get Comprehensive Info
    // ==========================================
    console.log('\n📊 PART 5: Paymaster Information');
    console.log('=====================================\n');

    const info = await paymaster.getInfo();
    console.log('Paymaster Address:', info.paymasterAddress);
    console.log('Owner:', info.owner);
    console.log('Balance:', ethers.formatEther(info.balance), 'MNT');
    console.log('Is Paused:', info.isPaused);
    console.log('Relayer Approved:', info.relayerApproved);
    console.log('\nLimits:');
    console.log('  Max Gas Per Transaction:', info.limits.maxGasPerTransaction.toString());
    console.log('  Min Balance Required:', ethers.formatEther(info.limits.minBalanceRequired), 'MNT');
    console.log('\nAnalytics:');
    console.log('  Total Transactions:', info.analytics.totalTransactions.toString());
    console.log('  Total Gas Sponsored:', ethers.formatEther(info.analytics.totalGasSponsored), 'MNT');
    console.log('  Average Gas Per TX:', info.analytics.averageGasPerTransaction.toString());
    console.log('\nWhitelisted Contracts:', info.whitelistedContracts.length);
    info.whitelistedContracts.forEach(contract => {
      console.log(`  - ${contract}`);
    });

    // ==========================================
    // PART 6: Monitor and Manage
    // ==========================================
    console.log('\n📈 PART 6: Monitoring Tips');
    console.log('=====================================\n');

    console.log('💡 Recommended Monitoring:');
    console.log('   1. Check balance regularly:');
    console.log('      const balance = await paymaster.getBalance();');
    console.log('      if (balance < minThreshold) { await paymaster.deposit(...) }');
    console.log('\n   2. Monitor analytics:');
    console.log('      const info = await paymaster.getInfo();');
    console.log('      console.log(info.analytics);');
    console.log('\n   3. Set up alerts for low balance');
    console.log('\n   4. Track gas costs vs. user value');

    console.log('\n💡 Management Commands:');
    console.log('   - Pause: await paymaster.pause()');
    console.log('   - Unpause: await paymaster.unpause()');
    console.log('   - Withdraw: await paymaster.withdraw(amount, recipient)');
    console.log('   - Update limits: await paymaster.setMaxGasPerTransaction(newLimit)');

    // ==========================================
    // PART 7: Example Monitoring Loop
    // ==========================================
    console.log('\n🔄 PART 7: Monitoring Loop Example');
    console.log('=====================================\n');

    console.log('Starting monitoring (will check every 30 seconds for 2 minutes)...\n');

    let iterations = 0;
    const maxIterations = 4;
    const interval = 30000; // 30 seconds

    const monitor = setInterval(async () => {
      try {
        iterations++;
        console.log(`\n[${new Date().toISOString()}] Check #${iterations}`);
        
        const currentBalance = await paymaster.getBalance();
        const currentInfo = await paymaster.getInfo();
        
        console.log(`  Balance: ${ethers.formatEther(currentBalance)} MNT`);
        console.log(`  Total TXs: ${currentInfo.analytics.totalTransactions.toString()}`);
        console.log(`  Total Gas: ${ethers.formatEther(currentInfo.analytics.totalGasSponsored)} MNT`);
        
        // Alert if balance is low
        const minBalance = ethers.parseEther('1');
        if (currentBalance < minBalance) {
          console.log('  ⚠️  WARNING: Balance below 1 MNT!');
          console.log('  💡 Consider funding: await paymaster.deposit(ethers.parseEther("5"))');
        }

        if (iterations >= maxIterations) {
          clearInterval(monitor);
          console.log('\n✅ Monitoring completed');
        }
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    }, interval);

    // Wait for monitoring to complete
    await new Promise(resolve => setTimeout(resolve, interval * maxIterations + 1000));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Developer wallet needs more MNT for gas fees');
      console.log('   Get testnet MNT from: https://faucet.sepolia.mantle.xyz');
    }
    
    process.exit(1);
  }
}

// Run the example
main()
  .then(() => {
    console.log('\n✅ Paymaster management example completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Example failed:', error);
    process.exit(1);
  });
