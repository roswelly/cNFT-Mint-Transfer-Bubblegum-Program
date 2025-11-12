import {
  createAllocTreeIx,
  createInitEmptyMerkleTreeIx,
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  MPL_BUBBLEGUM_PROGRAM_ID,
  findTreeConfigPda,
} from "@metaplex-foundation/mpl-bubblegum";

export async function createTree(
  connection: Connection,
  payer: Keypair,
  treeAuthority: Keypair,
  maxDepth: 14 | 3 | 5 | 15 | 16 | 17 | 18 | 19 | 20 | 24 | 26 | 30 = 14,
  maxBufferSize: 64 | 8 | 256 | 1024 | 2048 | 512 = 64
): Promise<{ merkleTree: PublicKey; treeConfig: PublicKey; merkleTreeKeypair: Keypair }> {
  const merkleTree = Keypair.generate();
  const treeConfig = findTreeConfigPda({ merkleTree: merkleTree.publicKey })[0];

  const depthSizePair: ValidDepthSizePair = {
    maxDepth: maxDepth as any,
    maxBufferSize: maxBufferSize as any,
  };

  const requiredSpace = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize
  );

  const allocTreeIx = await createAllocTreeIx(
    connection,
    merkleTree.publicKey,
    payer.publicKey,
    depthSizePair,
    requiredSpace
  );

  const initTreeIx = createInitEmptyMerkleTreeIx(
    merkleTree.publicKey,
    payer.publicKey,
    depthSizePair
  );

  const tx = new Transaction()
    .add(allocTreeIx)
    .add(initTreeIx);

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [payer, merkleTree],
    {
      commitment: "confirmed",
      skipPreflight: false,
    }
  );

  console.log("Tree created! Signature:", signature);
  console.log("Merkle Tree:", merkleTree.publicKey.toBase58());
  console.log("Tree Config:", treeConfig.toBase58());

  return {
    merkleTree: merkleTree.publicKey,
    treeConfig,
    merkleTreeKeypair: merkleTree,
  };
}

export function getTreeConfigPDA(merkleTree: PublicKey): PublicKey {
  return findTreeConfigPda({ merkleTree })[0];
}

export function getMerkleTreePDA(seed: string): PublicKey {
  const [merkleTree] = PublicKey.findProgramAddressSync(
    [Buffer.from(seed)],
    MPL_BUBBLEGUM_PROGRAM_ID
  );
  return merkleTree;
}
