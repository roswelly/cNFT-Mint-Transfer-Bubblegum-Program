import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bubbblegum } from "../target/types/bubbblegum";
import {
  MetadataArgs,
  Creator,
  Collection,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  PublicKey,
  Keypair,
  Connection,
} from "@solana/web3.js";

export async function mintCnftViaWrapper(
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

  const tx = await program.methods
    .mintCnft(metadataArgs)
    .accounts({
      treeConfig,
      merkleTree,
      leafOwner,
      payer: payer.publicKey,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([payer])
    .rpc();

  console.log("Compressed NFT minted via wrapper! Signature:", tx);
  return tx;
}

export async function mintCnftBatchViaWrapper(
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
  const metadataArgsList: MetadataArgs[] = metadataList.map((metadata) => ({
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
    creators: metadata.creators || null,
    collection: metadata.collection || null,
    uses: null,
  }));

  const tx = await program.methods
    .mintCnftBatch(metadataArgsList)
    .accounts({
      treeConfig,
      merkleTree,
      leafOwner,
      payer: payer.publicKey,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([payer])
    .rpc();

  console.log(`Batch minted ${metadataList.length} compressed NFTs via wrapper! Signature:`, tx);
  return tx;
}
