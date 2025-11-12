import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { mintCnft, createCreator } from "./client/mintCnft";
import { createTree } from "./tests/helpers/tree";
import * as fs from "fs";

async function main() {
  console.log("🚀 Starting cNFT Mint Test\n");

  const connection = new Connection(
    clusterApiUrl("devnet"),
    "confirmed"
  );

  const walletPath = process.env.ANCHOR_WALLET || 
    (process.env.HOME ? `${process.env.HOME}/.config/solana/id.json` : "~/.config/solana/id.json");
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  console.log("📋 Configuration:");
  console.log("   Cluster: devnet");
  console.log("   Payer:", payerKeypair.publicKey.toBase58());
  
  const balance = await connection.getBalance(payerKeypair.publicKey);
  console.log("   Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log("⚠️  Low balance. Requesting airdrop...");
    const airdropSig = await connection.requestAirdrop(
      payerKeypair.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
    console.log("✅ Airdrop received!\n");
  }

  const wallet = new anchor.Wallet(payerKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  console.log("📦 Using direct Bubblegum calls\n");

  console.log("🌳 Step 1: Creating Merkle Tree...");
  const treeAuthority = Keypair.generate();
  
  try {
    const airdropSig = await connection.requestAirdrop(
      treeAuthority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
  } catch (e) {
    console.log("   Note: Airdrop may have rate limit, continuing...");
  }

  const { merkleTree, treeConfig } = await createTree(
    connection,
    payerKeypair,
    treeAuthority,
    14,
    64
  );

  console.log("   ✅ Tree created!");
  console.log("   Merkle Tree:", merkleTree.toBase58());
  console.log("   Tree Config:", treeConfig.toBase58(), "\n");

  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("🎨 Step 2: Minting Compressed NFT...");
  
  const leafOwner = payerKeypair.publicKey;
  const metadata = {
    name: "Test Compressed NFT #1",
    symbol: "TCNFT",
    uri: "https://example.com/metadata.json",
    sellerFeeBasisPoints: 500,
    creators: [
      createCreator(payerKeypair.publicKey, 100, true),
    ],
  };

  console.log("   Metadata:");
  console.log("   - Name:", metadata.name);
  console.log("   - Symbol:", metadata.symbol);
  console.log("   - URI:", metadata.uri);
  console.log("   - Leaf Owner:", leafOwner.toBase58(), "\n");

  try {
    const dummyProgram = {} as any;
    const signature = await mintCnft(
      dummyProgram,
      connection,
      payerKeypair,
      treeConfig,
      merkleTree,
      leafOwner,
      metadata
    );

    console.log("   ✅ Mint successful!");
    console.log("\n" + "=".repeat(60));
    console.log("📝 TRANSACTION DETAILS:");
    console.log("=".repeat(60));
    console.log("   Transaction Signature:", signature);
    console.log("   Explorer URL:", 
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("   Solscan URL:", 
      `https://solscan.io/tx/${signature}?cluster=devnet`);
    console.log("=".repeat(60) + "\n");

    console.log("🔍 Verifying transaction...");
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (tx && tx.meta && !tx.meta.err) {
      console.log("   ✅ Transaction confirmed successfully!");
      console.log("   Block Time:", tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : "N/A");
      console.log("   Fee:", tx.meta.fee / LAMPORTS_PER_SOL, "SOL");
    } else {
      console.log("   ⚠️  Transaction may have failed:", tx?.meta?.err || "Unknown error");
    }

    const logData = {
      timestamp: new Date().toISOString(),
      transaction: signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      metadata: metadata,
      merkleTree: merkleTree.toBase58(),
      treeConfig: treeConfig.toBase58(),
      leafOwner: leafOwner.toBase58(),
    };

    fs.writeFileSync(
      "mint-transaction-log.json",
      JSON.stringify(logData, null, 2)
    );

    console.log("\n💾 Transaction details saved to: mint-transaction-log.json");
    console.log("\n✅ Test completed successfully!\n");

  } catch (error) {
    console.error("\n❌ Mint failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
