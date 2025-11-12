#!/bin/bash

# Deploy script for devnet
# This script builds and deploys the program to devnet

set -e

echo "🚀 Deploying to Devnet..."
echo ""

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor is not installed. Please install it first:"
    echo "   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    echo "   avm install latest"
    echo "   avm use latest"
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI is not installed. Please install it first."
    exit 1
fi

# Set cluster to devnet
echo "📡 Setting cluster to devnet..."
solana config set --url devnet

# Check wallet balance
echo ""
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance --lamports)
echo "Current balance: $BALANCE lamports"

if [ "$BALANCE" -lt 1000000000 ]; then
    echo "⚠️  Low balance detected. Requesting airdrop..."
    solana airdrop 2
    echo "✅ Airdrop completed!"
fi

# Build the program
echo ""
echo "🔨 Building program..."
anchor build

# Get the program ID from the build output
PROGRAM_ID=$(solana address -k target/deploy/bubbblegum-keypair.json)
echo ""
echo "📋 Program ID: $PROGRAM_ID"

# Update Anchor.toml with the program ID if needed
echo ""
echo "📝 Checking Anchor.toml..."
CURRENT_ID=$(grep -A 1 "\[programs.devnet\]" Anchor.toml | grep "bubbblegum" | cut -d '"' -f 2)

if [ "$CURRENT_ID" != "$PROGRAM_ID" ]; then
    echo "⚠️  Program ID mismatch detected!"
    echo "   Current in Anchor.toml: $CURRENT_ID"
    echo "   Built program ID: $PROGRAM_ID"
    echo ""
    read -p "Update Anchor.toml? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update the devnet program ID
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|bubbblegum = \".*\"|bubbblegum = \"$PROGRAM_ID\"|" Anchor.toml
        else
            sed -i "s|bubbblegum = \".*\"|bubbblegum = \"$PROGRAM_ID\"|" Anchor.toml
        fi
        echo "✅ Anchor.toml updated!"
    fi
fi

# Deploy the program
echo ""
echo "🚀 Deploying program to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Program Details:"
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: Devnet"
echo "   Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "🧪 Run tests with: anchor test --provider.cluster devnet"

