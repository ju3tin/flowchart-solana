import { Connection, PublicKey } from '@solana/web3.js';
import { BPF_UPGRADE_LOADER_ID } from './instructionData';

export async function checkBufferAuthority(
  connection: Connection,
  bufferPubkey: PublicKey
): Promise<PublicKey | null> {
  const accountInfo = await connection.getAccountInfo(bufferPubkey);
  if (!accountInfo) throw new Error('Buffer account not found');
  if (!accountInfo.owner.equals(BPF_UPGRADE_LOADER_ID)) throw new Error('Account is not owned by BPF_UPGRADE_LOADER_ID');
  const data = accountInfo.data;
  if (data[0] !== 1) throw new Error('Not a Buffer account (tag != 1)');
  const AUTHORITY_OFFSET = 1 + 4;
  const authorityRaw = data.subarray(AUTHORITY_OFFSET, AUTHORITY_OFFSET + 32);
  return new PublicKey(authorityRaw);
}
