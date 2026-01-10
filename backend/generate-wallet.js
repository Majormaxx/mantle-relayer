// Generate a new Ethereum wallet for the relayer
const { Wallet } = require('ethers');

const wallet = Wallet.createRandom();

console.log('\n=================================');
console.log('🔑 NEW RELAYER WALLET CREATED');
console.log('=================================\n');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\n⚠️  IMPORTANT:');
console.log('- Save this private key securely!');
console.log('- Never commit it to git');
console.log('- Fund this address with MNT from faucet');
console.log('- This wallet must be approved in RelayerHub');
console.log('\n=================================\n');
