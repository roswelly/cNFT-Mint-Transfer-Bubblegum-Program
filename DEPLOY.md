# Deployment Guide for Devnet

This guide will help you deploy your cNFT mint program to Solana devnet and run tests.

## Prerequisites

1. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Install Anchor**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Install Dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

## Step 1: Configure Solana CLI for Devnet

```bash
solana config set --url devnet
```

## Step 2: Create/Check Your Wallet

```bash
# Check if you have a wallet
solana address

# If not, create one
solana-keygen new

# Or use an existing keypair file
solana config set --keypair ~/path/to/your/keypair.json
```

## Step 3: Fund Your Wallet

```bash
# Check balance
solana balance

# Request airdrop (devnet only)
solana airdrop 2

# Verify balance
solana balance
```

## Step 4: Build the Program

```bash
anchor build
```

This will:
- Compile your Rust program
- Generate the program ID
- Create the deploy keypair

**Important**: After building, note the program ID from the output. You may need to update `Anchor.toml` if it doesn't match.

## Step 5: Deploy to Devnet

### Option A: Using Anchor (Recommended)

```bash
anchor deploy --provider.cluster devnet
```

### Option B: Using the Deploy Script

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/deploy-devnet.sh

# Run the script
./scripts/deploy-devnet.sh
```

Or using Node.js version:
```bash
node scripts/deploy-devnet.js
```

## Step 6: Verify Deployment

```bash
# Check program account
solana program show <YOUR_PROGRAM_ID>

# View on explorer
# https://explorer.solana.com/address/<YOUR_PROGRAM_ID>?cluster=devnet
```

## Step 7: Run Tests

```bash
# Run all tests
anchor test --provider.cluster devnet

# Or run with verbose output
anchor test --provider.cluster devnet --skip-deploy
```

## Troubleshooting

### Issue: "Program ID mismatch"

**Solution**: After `anchor build`, update `Anchor.toml` with the generated program ID:
```toml
[programs.devnet]
bubbblegum = "<YOUR_GENERATED_PROGRAM_ID>"
```

### Issue: "Insufficient funds"

**Solution**: Request more airdrop:
```bash
solana airdrop 2
```

Note: Devnet has rate limits. If you hit the limit, wait a few minutes or use a different wallet.

### Issue: "Transaction simulation failed"

**Solution**: 
1. Check that all required accounts exist
2. Verify you have enough SOL for fees
3. Check the transaction on Solana Explorer for detailed error messages

### Issue: "Tree creation fails"

**Solution**: 
- Make sure you have enough SOL (tree creation requires ~0.1-0.2 SOL)
- Verify the compression program is available on devnet
- Check that all program IDs are correct

## Program IDs Reference

- **Bubblegum Program**: `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`
- **Token Metadata Program**: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`
- **Compression Program**: `cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK`
- **Noop Program**: `noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV`

## Next Steps

After successful deployment:

1. **Test minting**: Run the test suite to verify everything works
2. **Update metadata**: Customize the metadata URIs in your tests
3. **Monitor**: Check transactions on Solana Explorer
4. **Deploy to mainnet**: Once tested, follow similar steps for mainnet (with real SOL!)

## Useful Commands

```bash
# Check program account size
solana program show <PROGRAM_ID>

# View recent transactions
solana confirm -v <TRANSACTION_SIGNATURE>

# Check account balance
solana balance <ACCOUNT_ADDRESS>

# View account info
solana account <ACCOUNT_ADDRESS>
```

## Resources

- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Anchor Documentation](https://www.anchor-lang.com/docs)
- [Metaplex Bubblegum Docs](https://developers.metaplex.com/bubblegum)

