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

export async function createTree(
  connection: Connection,
  payer: Keypair,
  _treeAuthority: Keypair,
  _maxDepth: number = 14,
  _maxBufferSize: number = 64
): Promise<{ merkleTree: PublicKey; treeConfig: PublicKey; merkleTreeKeypair: Keypair }> {
  const merkleTree = Keypair.generate();
  
  const BUBBLEGUM_PROGRAM_ID = new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY");
  const [treeConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("tree-config"), merkleTree.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const depthSizePair: ValidDepthSizePair = {
    maxDepth: 14,
    maxBufferSize: 64,
  };

  const requiredSpace = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize
  );
  
  console.log(`Tree parameters: depth=${depthSizePair.maxDepth}, buffer=${depthSizePair.maxBufferSize}, size=${requiredSpace} bytes`);

  const allocTreeIx = await createAllocTreeIx(
    connection,
    merkleTree.publicKey,
    payer.publicKey,
    depthSizePair,
    0
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
  const BUBBLEGUM_PROGRAM_ID = new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY");
  const [treeConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("tree-config"), merkleTree.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );
  return treeConfig;
}
