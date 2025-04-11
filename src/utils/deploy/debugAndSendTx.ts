import { Connection, PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export async function debugAndSendTransaction(
    tx: Transaction,
    connection: Connection,
    sendTransaction: (tx: Transaction, connection: Connection, options: { signers?: Keypair[] }) => Promise<string>,
    signers?: Keypair[],
    walletPublicKey?: PublicKey,
) {
    const blockhashInfo = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
        payerKey: walletPublicKey || new PublicKey(''),
        recentBlockhash: blockhashInfo.blockhash,
        instructions: tx.instructions,
      }).compileToV0Message();

    const versionedTx = new VersionedTransaction(messageV0);

    const simulateConfig = {
      sigVerify: false,
      replaceRecentBlockhash: false,
      accounts: {
        addresses: [
          "9YqR7rJEHQx6BiboMhUNz9QdPrk6nHwov2TvSGhvwppK"
        ] as string[],
        encoding: "base64" as const, 
      },
    };

    const simResult = await connection.simulateTransaction(versionedTx, simulateConfig);
    console.log('Simulation logs:', simResult.value?.logs);

    if (simResult.value.err) {
        console.error('Simulation error:', simResult.value.err);
    }

    const signature = await sendTransaction(tx, connection, { signers });
    console.log('Signature:', signature);

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
        {
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature,
        },
        'confirmed'
    );

  return signature;
}
