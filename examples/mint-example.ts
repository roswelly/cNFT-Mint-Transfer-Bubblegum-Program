import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bubbblegum } from "../target/types/bubbblegum";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { mintCnft, createCreator } from "../client/mintCnft";
import { createTree } from "../tests/helpers/tree";
import * as fs from "fs";

async function main() {
  const connection = new Connection(
    clusterApiUrl("devnet"),
    "confirmed"
  );

  const walletPath = process.env.ANCHOR_WALLET || 
    (process.env.HOME ? `${process.env.HOME}/.config/solana/id.json` : "~/.config/solana/id.json");
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  const wallet = new anchor.Wallet(payerKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = anchor.workspace.Bubbblegum as Program<Bubbblegum>;

  console.log("Program ID:", program.programId.toBase58());

  console.log("\n=== Creating Merkle Tree ===");
  const treeAuthority = Keypair.generate();
  
  try {
    const airdropSig = await connection.requestAirdrop(
      treeAuthority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
    console.log("Airdropped SOL to tree authority");
  } catch (e) {
    console.log("Airdrop failed (might be mainnet or insufficient funds)");
  }

  const { merkleTree, treeConfig } = await createTree(
    connection,
    payerKeypair,
    treeAuthority,
    14,
    64
  );

  console.log("Merkle Tree:", merkleTree.toBase58());
  console.log("Tree Config:", treeConfig.toBase58());
  console.log("Tree Authority:", treeAuthority.publicKey.toBase58());

  console.log("\n=== Minting Compressed NFT ===");
  
  const leafOwner = payerKeypair.publicKey;
  
  const metadata = {
    name: "My First Compressed NFT",
    symbol: "MCNFT",
    uri: "https://example.com/metadata.json",
    sellerFeeBasisPoints: 500,
    creators: [
      createCreator(payerKeypair.publicKey, 100, true),
    ],
  };

  try {
    const signature = await mintCnft(
      program,
      connection,
      payerKeypair,
      treeConfig,
      merkleTree,
      leafOwner,
      metadata
    );

    console.log("✅ Compressed NFT minted successfully!");
    console.log("Transaction signature:", signature);
    console.log("View on Solana Explorer:", 
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (error) {
    console.error("❌ Error minting cNFT:", error);
    throw error;
  }

  console.log("\n=== Batch Minting Example ===");
  console.log("(Uncomment the code below to test batch minting)");
}

main()
  .then(() => {
    console.log("\n✅ Example completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Example failed:", error);
    process.exit(1);
  });
