import { PublicKey } from "@solana/web3.js";
import { Buffer } from 'buffer';

export const BPF_UPGRADE_LOADER_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');

function createInitializeBufferData(): Buffer {
    return Buffer.from([0, 0, 0, 0]);
}

function createDeployInstructionData(maxDataLen: number): Buffer {
    const variantTag = Buffer.from([2, 0, 0, 0]);
    const lenBuf = Buffer.alloc(8);
    lenBuf.writeBigUInt64LE(BigInt(maxDataLen), 0);
    return Buffer.concat([variantTag, lenBuf]);
}

function createWriteBufferInstructionData(offset: number, chunk: Buffer): Buffer {
    const variantTag = Buffer.from([1, 0, 0, 0]);
    const offsetBuf = Buffer.alloc(4);
    offsetBuf.writeUInt32LE(offset, 0);
    const lenBuf = Buffer.alloc(8);
    lenBuf.writeBigUInt64LE(BigInt(chunk.length), 0);
    return Buffer.concat([variantTag, offsetBuf, lenBuf, chunk]);
}

export { createInitializeBufferData, createDeployInstructionData, createWriteBufferInstructionData };

export function createSetAuthorityInstructionData(): Buffer {
    return Buffer.from([4, 0, 0, 0]);
  }
