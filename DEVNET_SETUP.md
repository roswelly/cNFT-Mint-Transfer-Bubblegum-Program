# Devnet Setup Summary

## ✅ What's Been Configured

### 1. Anchor Configuration
- ✅ Updated `Anchor.toml` to support devnet deployment
- ✅ Added devnet program ID configuration
- ✅ Set default cluster to Devnet

### 2. Test Suite
- ✅ Complete test suite in `tests/bubbblegum.ts` with:
  - Tree creation setup
  - Single cNFT mint test
  - Batch mint test
  - Wrapper program test
- ✅ Automatic airdrop handling with retries
- ✅ Proper error handling and verification

### 3. Client Functions
- ✅ Fixed `mintCnft.ts` to properly fetch tree authority
- ✅ Both direct and wrapper client functions available
- ✅ Helper functions for creators and collections

### 4. Deployment Scripts
- ✅ Bash script: `scripts/deploy-devnet.sh`
- ✅ Node.js script: `scripts/deploy-devnet.js`
- ✅ Both handle program ID updates automatically

### 5. Documentation
- ✅ `DEPLOY.md` - Complete deployment guide
- ✅ `README.md` - Updated with devnet instructions
- ✅ `QUICKSTART.md` - Quick start guide

## 🚀 Quick Deploy to Devnet

```bash
# 1. Install dependencies
yarn install

# 2. Build the program
anchor build

# 3. Deploy to devnet
anchor deploy --provider.cluster devnet

# 4. Run tests
anchor test --provider.cluster devnet
```

## 🧪 Running Tests

The test suite includes:

1. **Tree Creation** - Automatically creates a merkle tree
2. **Single Mint** - Mints one compressed NFT
3. **Batch Mint** - Mints multiple compressed NFTs
4. **Wrapper Test** - Tests the wrapper program (if deployed)

```bash
# Run all tests
anchor test --provider.cluster devnet

# Or use the deploy script which includes testing
./scripts/deploy-devnet.sh
```

## 📋 Test Output

When tests run successfully, you'll see:

```
=== Setting up test environment ===
Cluster: https://api.devnet.solana.com
Payer: <your-wallet-address>
✅ Tree created successfully!
Merkle Tree: <tree-address>
Tree Config: <config-address>

=== Test: Mint Compressed NFT ===
✅ Mint successful!
Transaction signature: <signature>
View on Solana Explorer: https://explorer.solana.com/tx/<signature>?cluster=devnet
✅ Transaction verified!
```

## 🔧 Important Notes

1. **Program ID**: After building, the program ID is auto-generated. The deploy scripts will update `Anchor.toml` automatically.

2. **Airdrops**: Devnet has rate limits. The test suite includes retry logic, but if you hit limits, wait a few minutes.

3. **Tree Creation**: Creating a merkle tree requires ~0.1-0.2 SOL. Make sure your wallet has enough funds.

4. **Network**: All tests are configured for devnet. Change the cluster in `Anchor.toml` to switch networks.

## 📚 Next Steps

1. **Deploy**: Run `anchor deploy --provider.cluster devnet`
2. **Test**: Run `anchor test --provider.cluster devnet`
3. **Verify**: Check transactions on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
4. **Customize**: Update metadata URIs and test parameters as needed

## 🐛 Troubleshooting

### Tests fail with "Insufficient funds"
```bash
solana airdrop 2 --url devnet
```

### Program ID mismatch
The deploy scripts handle this automatically, but you can manually update `Anchor.toml`:
```toml
[programs.devnet]
bubbblegum = "<your-program-id>"
```

### Tree creation fails
- Ensure you have enough SOL (request airdrop)
- Check that compression programs are available on devnet
- Verify all program IDs are correct

## 📖 Resources

- [Deployment Guide](./DEPLOY.md)
- [Quick Start](./QUICKSTART.md)
- [Main README](./README.md)

