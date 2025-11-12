# Quick Start Guide

Get up and running with your cNFT mint program in minutes!

## Prerequisites Check

Make sure you have these installed:
```bash
# Check Rust
rustc --version

# Check Solana CLI
solana --version

# Check Anchor
anchor --version

# Check Node.js
node --version
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
yarn install
# or
npm install
```

### 2. Build the Program

```bash
anchor build
```

This will:
- Generate the program ID
- Build the Rust program
- Generate TypeScript types

**Important**: After building, check `target/deploy/bubbblegum-keypair.json` and update the program ID in `Anchor.toml` if needed.

### 3. Start Local Validator

In a separate terminal:
```bash
solana-test-validator
```

### 4. Configure Solana CLI

```bash
solana config set --url localhost
```

### 5. Airdrop SOL (for localnet)

```bash
solana airdrop 2
```

### 6. Deploy the Program

```bash
anchor deploy
```

### 7. Run the Example

```bash
# Make sure you have ts-node installed
yarn add -D ts-node

# Run the example
ts-node examples/mint-example.ts
```

## Common Issues

### Issue: "Program ID mismatch"
**Solution**: After `anchor build`, copy the program ID from the build output and update `Anchor.toml`.

### Issue: "Insufficient funds"
**Solution**: Run `solana airdrop 2` to get test SOL on localnet.

### Issue: "Tree not found"
**Solution**: Make sure you create a merkle tree first. See `tests/helpers/tree.ts` for an example.

### Issue: "Unauthorized"
**Solution**: Ensure the payer is the tree authority. The tree authority is set when creating the tree.

## Next Steps

1. Read the full [README.md](./README.md) for detailed documentation
2. Check out [examples/mint-example.ts](./examples/mint-example.ts) for a complete example
3. Customize the program in `programs/bubbblegum/src/lib.rs` to add your own logic

## Testing

Run the test suite:
```bash
anchor test
```

## Deployment to Devnet/Mainnet

1. Update `Anchor.toml`:
   ```toml
   [provider]
   cluster = "Devnet"  # or "Mainnet"
   ```

2. Build and deploy:
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

3. Make sure you have SOL in your wallet for the target network!

