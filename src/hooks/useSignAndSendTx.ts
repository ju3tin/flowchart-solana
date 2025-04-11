import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { debugAndSendTransaction } from '../utils/deploy/debugAndSendTx';

export function useSignAndSendTx() {
  const { publicKey, sendTransaction } = useWallet();

  const signAndSendTransaction = async (
    tx: Transaction,
    signers?: Keypair[],
  ): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    //const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    //const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    const connection = new Connection('https://tiniest-smart-putty.solana-devnet.quiknode.pro/31fdf5493679b4c1c854289d95c822094900efc2/', 'confirmed');

    const signature = await debugAndSendTransaction(tx, connection, sendTransaction, signers, publicKey);

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
  };

  return signAndSendTransaction;
}
