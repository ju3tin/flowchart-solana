import { Transaction } from '@solana/web3.js';

export const signTransaction = async (transaction: Transaction): Promise<Transaction> => {
  throw new Error('signTransaction needs to be implemented with the actual wallet');
  return transaction;
}; 