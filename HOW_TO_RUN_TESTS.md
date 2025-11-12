# How to Run Test Scripts

## Available Test Scripts

### 1. Anchor Test Suite (Recommended)
Runs the full test suite with Anchor framework:

```bash
# Run tests on devnet (skips deployment)
anchor test --provider.cluster devnet --skip-deploy

# Run tests on devnet (with deployment)
anchor test --provider.cluster devnet

# Run tests on localnet
anchor test
```

### 2. Simple Mint Test Script
Basic test script for minting (currently has API compatibility issues):

```bash
# Using npm script
npm run test:mint-simple

# Or directly with ts-node
npx ts-node test-mint-simple.ts
```

### 3. Full Mint Test Script
Complete mint test with transaction logging:

```bash
# Using npm script
npm run test:mint

# Or directly with ts-node
npx ts-node test-mint.ts
```

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure program is deployed:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. **Check wallet balance:**
   ```bash
   solana balance
   # Should have at least 1-2 SOL for testing
   ```

## Current Status

⚠️ **API Compatibility Issue**: The test scripts currently have issues with `@metaplex-foundation/mpl-bubblegum` v3.1.2 API. The package exports have changed.

### Quick Fix:

Upgrade to mpl-bubblegum v4+ which uses the Umi SDK:

```bash
npm install @metaplex-foundation/mpl-bubblegum@^4.4.0
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults
```

Then update the client code to use the new Umi-based API.

## Running Tests Step by Step

### Option 1: Using Anchor Test (If IDL exists)

```bash
# 1. Build the program
anchor build

# 2. Deploy (if not already deployed)
anchor deploy --provider.cluster devnet

# 3. Run tests
anchor test --provider.cluster devnet --skip-deploy
```

### Option 2: Using TypeScript Test Scripts

```bash
# 1. Make sure dependencies are installed
npm install

# 2. Run the simple test
npm run test:mint-simple

# 3. Or run the full test with logging
npm run test:mint
```

## Expected Output

When tests run successfully, you should see:

```
🚀 Starting cNFT Mint Test

📋 Configuration:
   Cluster: devnet
   Payer: <your-wallet-address>
   Balance: X.XX SOL

🌳 Step 1: Creating Merkle Tree...
   ✅ Tree created!
   Merkle Tree: <tree-address>
   Tree Config: <config-address>

🎨 Step 2: Minting Compressed NFT...
   ✅ Mint successful!

📝 TRANSACTION DETAILS:
   Transaction Signature: <signature>
   Explorer URL: https://explorer.solana.com/tx/<signature>?cluster=devnet
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Run `npm install` to install dependencies

### Issue: "IDL doesn't exist"
**Solution**: This is expected. The program compiles but IDL generation has issues. Tests can still run using direct Bubblegum calls.

### Issue: "API compatibility errors"
**Solution**: Upgrade mpl-bubblegum to v4+ or update client code to match v3.1.2 API

### Issue: "Insufficient funds"
**Solution**: Request airdrop:
```bash
solana airdrop 2 --url devnet
```

### Issue: "Tree creation fails"
**Solution**: 
- Ensure you have enough SOL (0.1-0.2 SOL per tree)
- Check that compression programs are available on devnet
- Wait a few seconds between tree creation and minting

## Viewing Transaction Logs

After running tests, transaction details are saved to:
- `mint-transaction-log.json` (for full test)
- `mint-setup-log.json` (for simple test)

You can also view transactions on:
- Solana Explorer: https://explorer.solana.com/?cluster=devnet
- Solscan: https://solscan.io/?cluster=devnet

## Next Steps

1. Fix API compatibility issues by upgrading packages
2. Update client code to use new API
3. Run successful mint tests
4. Verify minted NFTs on blockchain explorers

