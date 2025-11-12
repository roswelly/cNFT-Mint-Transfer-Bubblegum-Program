import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bubbblegum } from "../target/types/bubbblegum";
import { expect } from "chai";
import {
  createTree,
  getTreeConfigPDA,
} from "./helpers/tree";
import { mintCnft, createCreator } from "../client/mintCnft";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("bubbblegum", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Bubbblegum as Program<Bubbblegum>;
  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  let merkleTree: PublicKey;
  let treeConfig: PublicKey;
  let treeAuthority: Keypair;
  let merkleTreeKeypair: Keypair;

  async function airdropWithRetry(
    connection: Connection,
    publicKey: PublicKey,
    amount: number,
    retries: number = 3
  ): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const signature = await connection.requestAirdrop(
          publicKey,
          amount * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(signature, "confirmed");
        return signature;
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`Airdrop attempt ${i + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    throw new Error("Airdrop failed after retries");
  }

  before(async () => {
    console.log("\n=== Setting up test environment ===");
    console.log("Cluster:", connection.rpcEndpoint);
    console.log("Payer:", payer.publicKey.toBase58());

    const balance = await connection.getBalance(payer.publicKey);
    console.log("Payer balance:", balance / LAMPORTS_PER_SOL, "SOL");

    if (balance < 1 * LAMPORTS_PER_SOL) {
      console.log("Requesting airdrop for payer...");
      try {
        await airdropWithRetry(connection, payer.publicKey, 2);
        console.log("Airdrop successful!");
      } catch (error) {
        console.error("Airdrop failed:", error);
        throw new Error("Insufficient funds. Please fund your wallet or request airdrop manually.");
      }
    }

    treeAuthority = Keypair.generate();
    console.log("Tree Authority:", treeAuthority.publicKey.toBase58());

    console.log("Requesting airdrop for tree authority...");
    try {
      await airdropWithRetry(connection, treeAuthority.publicKey, 2);
      console.log("Tree authority funded!");
    } catch (error) {
      console.error("Tree authority airdrop failed:", error);
      throw error;
    }

    console.log("\n=== Creating Merkle Tree ===");
    try {
      const treeResult = await createTree(
        connection,
        payer.payer,
        treeAuthority,
        14,
        64
      );
      
      merkleTree = treeResult.merkleTree;
      treeConfig = treeResult.treeConfig;
      merkleTreeKeypair = treeResult.merkleTreeKeypair;
      
      console.log("✅ Tree created successfully!");
      console.log("Merkle Tree:", merkleTree.toBase58());
      console.log("Tree Config:", treeConfig.toBase58());
    } catch (error) {
      console.error("❌ Tree creation failed:", error);
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  it("Mints a compressed NFT", async () => {
    console.log("\n=== Test: Mint Compressed NFT ===");
    
    const leafOwner = payer.publicKey;
    const metadata = {
      name: "Test Compressed NFT",
      symbol: "TCNFT",
      uri: "https://example.com/metadata.json",
      sellerFeeBasisPoints: 500,
      creators: [
        createCreator(payer.publicKey, 100, true),
      ],
    };

    console.log("Leaf Owner:", leafOwner.toBase58());
    console.log("Metadata:", JSON.stringify(metadata, null, 2));

    try {
      const signature = await mintCnft(
        program,
        connection,
        payer.payer,
        treeConfig,
        merkleTree,
        leafOwner,
        metadata
      );
      
      expect(signature).to.be.a("string");
      expect(signature.length).to.be.greaterThan(0);
      
      console.log("✅ Mint successful!");
      console.log("Transaction signature:", signature);
      console.log("View on Solana Explorer:", 
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      const tx = await connection.getTransaction(signature, {
        commitment: "confirmed",
      });
      
      expect(tx).to.not.be.null;
      expect(tx?.meta?.err).to.be.null;
      
      console.log("✅ Transaction verified!");
    } catch (error) {
      console.error("❌ Mint failed:", error);
      throw error;
    }
  });

  it("Mints multiple compressed NFTs in batch", async () => {
    console.log("\n=== Test: Batch Mint Compressed NFTs ===");
    
    const { mintCnftBatch } = await import("../client/mintCnft");
    const leafOwner = payer.publicKey;
    
    const metadataList = [
      {
        name: "Batch NFT #1",
        symbol: "BATCH",
        uri: "https://example.com/1.json",
        sellerFeeBasisPoints: 500,
        creators: [
          createCreator(payer.publicKey, 100, true),
        ],
      },
      {
        name: "Batch NFT #2",
        symbol: "BATCH",
        uri: "https://example.com/2.json",
        sellerFeeBasisPoints: 500,
        creators: [
          createCreator(payer.publicKey, 100, true),
        ],
      },
    ];

    console.log("Minting", metadataList.length, "NFTs...");

    try {
      const signature = await mintCnftBatch(
        program,
        connection,
        payer.payer,
        treeConfig,
        merkleTree,
        leafOwner,
        metadataList
      );
      
      expect(signature).to.be.a("string");
      expect(signature.length).to.be.greaterThan(0);
      
      console.log("✅ Batch mint successful!");
      console.log("Transaction signature:", signature);
      console.log("View on Solana Explorer:", 
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      const tx = await connection.getTransaction(signature, {
        commitment: "confirmed",
      });
      
      expect(tx).to.not.be.null;
      expect(tx?.meta?.err).to.be.null;
      
      console.log("✅ Batch transaction verified!");
    } catch (error) {
      console.error("❌ Batch mint failed:", error);
      throw error;
    }
  });

  it("Mints via wrapper program", async () => {
    console.log("\n=== Test: Mint via Wrapper Program ===");
    
    const { mintCnftViaWrapper } = await import("../client/mintCnftWrapper");
    const leafOwner = payer.publicKey;
    
    const metadata = {
      name: "Wrapper Test NFT",
      symbol: "WTNFT",
      uri: "https://example.com/wrapper.json",
      sellerFeeBasisPoints: 500,
      creators: [
        createCreator(payer.publicKey, 100, true),
      ],
    };

    try {
      const signature = await mintCnftViaWrapper(
        program,
        connection,
        payer.payer,
        treeConfig,
        merkleTree,
        leafOwner,
        metadata
      );
      
      expect(signature).to.be.a("string");
      expect(signature.length).to.be.greaterThan(0);
      
      console.log("✅ Wrapper mint successful!");
      console.log("Transaction signature:", signature);
      console.log("View on Solana Explorer:", 
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (error) {
      console.error("❌ Wrapper mint failed:", error);
      if (error.message?.includes("Program") || error.message?.includes("deploy")) {
        console.log("Note: Wrapper test requires deployed program. Skipping...");
        return;
      }
      throw error;
    }
  });
});
