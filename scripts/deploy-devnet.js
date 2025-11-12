#!/usr/bin/env node

/**
 * Deploy script for devnet
 * Alternative Node.js version of the deploy script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

function checkCommand(command, name) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
  } catch (error) {
    console.error(`❌ ${name} is not installed. Please install it first.`);
    process.exit(1);
  }
}

console.log('🚀 Deploying to Devnet...\n');

// Check prerequisites
checkCommand('anchor', 'Anchor');
checkCommand('solana', 'Solana CLI');

// Set cluster to devnet
console.log('📡 Setting cluster to devnet...');
exec('solana config set --url devnet');

// Check wallet balance
console.log('\n💰 Checking wallet balance...');
const balanceOutput = exec('solana balance --lamports', { stdio: 'pipe' });
const balance = parseInt(balanceOutput.trim());

if (balance < 1000000000) {
  console.log('⚠️  Low balance detected. Requesting airdrop...');
  exec('solana airdrop 2');
  console.log('✅ Airdrop completed!');
}

// Build the program
console.log('\n🔨 Building program...');
exec('anchor build');

// Get program ID
const keypairPath = path.join(__dirname, '..', 'target', 'deploy', 'bubbblegum-keypair.json');
if (!fs.existsSync(keypairPath)) {
  console.error('❌ Keypair file not found. Build may have failed.');
  process.exit(1);
}

const programIdOutput = exec(`solana address -k ${keypairPath}`, { stdio: 'pipe' });
const programId = programIdOutput.trim();
console.log(`\n📋 Program ID: ${programId}`);

// Update Anchor.toml if needed
console.log('\n📝 Checking Anchor.toml...');
const anchorTomlPath = path.join(__dirname, '..', 'Anchor.toml');
const anchorToml = fs.readFileSync(anchorTomlPath, 'utf8');
const devnetMatch = anchorToml.match(/\[programs\.devnet\]\s+bubbblegum = "([^"]+)"/);

if (devnetMatch && devnetMatch[1] !== programId) {
  console.log('⚠️  Program ID mismatch detected!');
  console.log(`   Current in Anchor.toml: ${devnetMatch[1]}`);
  console.log(`   Built program ID: ${programId}`);
  
  const updatedToml = anchorToml.replace(
    /(\[programs\.devnet\]\s+bubbblegum = ")[^"]+(")/,
    `$1${programId}$2`
  );
  fs.writeFileSync(anchorTomlPath, updatedToml);
  console.log('✅ Anchor.toml updated!');
}

// Deploy
console.log('\n🚀 Deploying program to devnet...');
exec('anchor deploy --provider.cluster devnet');

console.log('\n✅ Deployment complete!');
console.log('\n📋 Program Details:');
console.log(`   Program ID: ${programId}`);
console.log('   Cluster: Devnet');
console.log(`   Explorer: https://explorer.solana.com/address/${programId}?cluster=devnet`);
console.log('\n🧪 Run tests with: anchor test --provider.cluster devnet');

