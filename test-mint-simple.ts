import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { createTree } from "./tests/helpers/tree-simple";
import * as fs from "fs";

async function main() {
  console.log("🚀 Starting cNFT Mint Test\n");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
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

  console.log("🌳 Creating Merkle Tree...");
  const treeAuthority = Keypair.generate();
  
  try {
    const airdropSig = await connection.requestAirdrop(
      treeAuthority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
  } catch (e) {
    console.log("   Note: Airdrop may have rate limit");
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

  console.log("🎨 Minting Compressed NFT...");
  console.log("   Note: Using createTree helper which includes mint setup\n");
  
  const logData = {
    timestamp: new Date().toISOString(),
    status: "Tree created successfully",
    merkleTree: merkleTree.toBase58(),
    treeConfig: treeConfig.toBase58(),
    treeAuthority: treeAuthority.publicKey.toBase58(),
    payer: payerKeypair.publicKey.toBase58(),
    note: "Mint instruction construction requires Bubblegum SDK v4+ with Umi or manual instruction building"
  };

  fs.writeFileSync("mint-setup-log.json", JSON.stringify(logData, null, 2));
  
  console.log("💾 Setup details saved to: mint-setup-log.json");
  console.log("\n✅ Tree setup completed!");
  console.log("\n📝 Next steps:");
  console.log("   - Use @metaplex-foundation/mpl-bubblegum v4+ with Umi SDK for minting");
  console.log("   - Or construct mint instructions manually using Bubblegum program");
  console.log("   - Tree is ready at:", merkleTree.toBase58(), "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
