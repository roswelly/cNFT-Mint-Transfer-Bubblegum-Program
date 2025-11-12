# Bubblegum cNFT Mint Program

A Solana program for minting compressed NFTs (cNFTs) using Metaplex Bubblegum.
## Transaction
- Merkle Tree creation 
[2JYmC87AQHSAx3Htz7aqFWs1opwHcG4nKVihDWvRbyfXyu5UWAaDYNwM26pHSFDwwkcj3LJjof4HUe1dtBNFjqy3](https://explorer.solana.com/tx/2JYmC87AQHSAx3Htz7aqFWs1opwHcG4nKVihDWvRbyfXyu5UWAaDYNwM26pHSFDwwkcj3LJjof4HUe1dtBNFjqy3?cluster=devnet)
## Overview

This program provides functionality to mint compressed NFTs on Solana using the Metaplex Bubblegum protocol. Compressed NFTs are significantly cheaper to mint than traditional NFTs because they use Merkle trees and state compression.

## Features

- ✅ Mint single compressed NFTs
- ✅ Batch mint multiple compressed NFTs
- ✅ Support for creators and collections
- ✅ Full TypeScript client support

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18.0 or later)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.29.0 or later)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) or npm

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bubbblegum
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Build the program:
```bash
anchor build
```

## Setup

1. Configure Solana CLI for localnet:
```bash
solana config set --url localhost
```

2. Generate a keypair if you don't have one:
```bash
solana-keygen new
```

3. Start a local validator:
```bash
solana-test-validator
```

4. In a new terminal, deploy the program:
```bash
anchor deploy
```

## Usage

### Option 1: Direct Bubblegum Call (Recommended for simple cases)

This calls Bubblegum directly without going through the wrapper program:

```typescript
import { mintCnft, createCreator } from "./client/mintCnft";
import { PublicKey, Keypair } from "@solana/web3.js";

const metadata = {
  name: "My Compressed NFT",
  symbol: "MCNFT",
  uri: "https://example.com/metadata.json",
  sellerFeeBasisPoints: 500, // 5%
  creators: [
    createCreator(payer.publicKey, 100, true),
  ],
};

const signature = await mintCnft(
  program,
  connection,
  payer,
  treeConfig,
  merkleTree,
  leafOwner,
  metadata
);
```

### Option 2: Using the Wrapper Program

This uses your deployed wrapper program (useful if you want to add custom logic):

```typescript
import { mintCnftViaWrapper, createCreator } from "./client/mintCnftWrapper";

const metadata = {
  name: "My Compressed NFT",
  symbol: "MCNFT",
  uri: "https://example.com/metadata.json",
  sellerFeeBasisPoints: 500, // 5%
  creators: [
    createCreator(payer.publicKey, 100, true),
  ],
};

const signature = await mintCnftViaWrapper(
  program,
  connection,
  payer,
  treeConfig,
  merkleTree,
  leafOwner,
  metadata
);
```

### Batch Minting

**Direct Bubblegum call:**
```typescript
import { mintCnftBatch } from "./client/mintCnft";

const metadataList = [
  {
    name: "NFT #1",
    symbol: "COLL",
    uri: "https://example.com/1.json",
    sellerFeeBasisPoints: 500,
  },
  {
    name: "NFT #2",
    symbol: "COLL",
    uri: "https://example.com/2.json",
    sellerFeeBasisPoints: 500,
  },
];

const signature = await mintCnftBatch(
  program,
  connection,
  payer,
  treeConfig,
  merkleTree,
  leafOwner,
  metadataList
);
```

**Using wrapper program:**
```typescript
import { mintCnftBatchViaWrapper } from "./client/mintCnftWrapper";

const signature = await mintCnftBatchViaWrapper(
  program,
  connection,
  payer,
  treeConfig,
  merkleTree,
  leafOwner,
  metadataList
);
```

## Program Structure

- `programs/bubbblegum/src/lib.rs` - Main program logic (wrapper that calls Bubblegum via CPI)
- `client/mintCnft.ts` - TypeScript client functions (direct Bubblegum calls)
- `client/mintCnftWrapper.ts` - TypeScript client functions (via wrapper program)
- `tests/bubbblegum.ts` - Test suite
- `tests/helpers/tree.ts` - Helper functions for tree management
- `examples/mint-example.ts` - Complete example script

## Important Notes

1. **Merkle Tree Setup**: Before minting, you need to create a Merkle tree using the Bubblegum SDK. See `tests/helpers/tree.ts` for an example.

2. **Tree Authority**: The tree authority must sign transactions for minting. Make sure the payer is the tree authority or has been delegated.

3. **Program ID**: When you build the program with `anchor build`, Anchor will generate a new program ID. The placeholder ID in the code will be automatically replaced. After building, update `Anchor.toml` with the generated program ID.

4. **Direct vs Wrapper**: 
   - Direct calls (`mintCnft.ts`) call Bubblegum directly - simpler and more efficient
   - Wrapper calls (`mintCnftWrapper.ts`) go through your program - useful if you want to add custom validation or logic

5. **Costs**: Compressed NFTs are much cheaper than regular NFTs, but you still need SOL for transaction fees.

## Testing

Run the test suite:
```bash
anchor test
```

## Deployment

### Localnet
```bash
anchor deploy
```

### Devnet
1. Update `Anchor.toml` to use devnet
2. Build and deploy:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Mainnet
1. Update `Anchor.toml` to use mainnet
2. Build and deploy:
```bash
anchor build
anchor deploy --provider.cluster mainnet
```

## Resources

- [Metaplex Bubblegum Documentation](https://developers.metaplex.com/bubblegum)
- [Solana Account Compression](https://spl.solana.com/account-compression)
- [Anchor Documentation](https://www.anchor-lang.com/docs)

## License

MIT

