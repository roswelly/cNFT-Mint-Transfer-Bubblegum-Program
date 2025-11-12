import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bubbblegum } from "../target/types/bubbblegum";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createMintV1Instruction,
  MetadataArgs,
  Creator,
  Collection,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
} from "@solana/web3.js";
import { TreeConfig } from "@metaplex-foundation/mpl-bubblegum";

export async function mintCnft(
  program: Program<Bubbblegum>,
  connection: Connection,
  payer: Keypair,
  treeConfig: PublicKey,
  merkleTree: PublicKey,
  leafOwner: PublicKey,
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators?: Creator[];
    collection?: Collection;
  }
): Promise<string> {
  const metadataArgs: MetadataArgs = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
    creators: metadata.creators || null,
    collection: metadata.collection || null,
    uses: null,
  };

  const treeConfigAccountInfo = await connection.getAccountInfo(treeConfig);
  if (!treeConfigAccountInfo) {
    throw new Error("Tree config account not found");
  }
  
  const treeAuthority = new PublicKey(treeConfigAccountInfo.data.slice(8, 40));

  const mintIx = createMintV1Instruction(
    {
      merkleTree,
      treeAuthority,
      leafOwner,
      leafDelegate: leafOwner,
      payer: payer.publicKey,
      treeCreatorOrDelegate: treeAuthority,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    {
      metadataArgs,
    }
  );

  const tx = new Transaction().add(mintIx);
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [payer],
    {
      commitment: "confirmed",
      skipPreflight: false,
    }
  );

  console.log("Compressed NFT minted! Signature:", signature);
  return signature;
}

export async function mintCnftBatch(
  program: Program<Bubbblegum>,
  connection: Connection,
  payer: Keypair,
  treeConfig: PublicKey,
  merkleTree: PublicKey,
  leafOwner: PublicKey,
  metadataList: Array<{
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators?: Creator[];
    collection?: Collection;
  }>
): Promise<string> {
  const treeConfigAccountInfo = await connection.getAccountInfo(treeConfig);
  if (!treeConfigAccountInfo) {
    throw new Error("Tree config account not found");
  }
  const treeAuthority = new PublicKey(treeConfigAccountInfo.data.slice(8, 40));

  const instructions = metadataList.map((metadata) => {
    const metadataArgs: MetadataArgs = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators || null,
      collection: metadata.collection || null,
      uses: null,
    };

    return createMintV1Instruction(
      {
        merkleTree,
        treeAuthority,
        leafOwner,
        leafDelegate: leafOwner,
        payer: payer.publicKey,
        treeCreatorOrDelegate: treeAuthority,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      {
        metadataArgs,
      }
    );
  });

  const tx = new Transaction().add(...instructions);
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [payer],
    {
      commitment: "confirmed",
      skipPreflight: false,
    }
  );

  console.log(`Batch minted ${metadataList.length} compressed NFTs! Signature:`, signature);
  return signature;
}

export function createCreator(
  address: PublicKey,
  share: number,
  verified: boolean = false
): Creator {
  return {
    address: address.toBase58(),
    share,
    verified,
  };
}

export function createCollection(
  key: PublicKey,
  verified: boolean = false
): Collection {
  return {
    key: key.toBase58(),
    verified,
  };
}
