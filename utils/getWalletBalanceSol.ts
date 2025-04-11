import { Connection, PublicKey } from '@solana/web3.js';

export async function getWalletBalanceSol(address: string): Promise<number> {
  const connection = new Connection("https://api.devnet.solana.com");
  const pubKey = new PublicKey(address);
  const lamports = await connection.getBalance(pubKey);
  const sol = lamports / 1_000_000_000;
  return sol;
}

export const functionDefs = [
  {
    type: 'function' as const,
    function: {
      name: "getWalletBalance",
      description: "Fetches the user's Solana wallet balance in SOL.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Base58 Solana public key"
          }
        },
        required: ["address"],
        additionalProperties: false
      },
      strict: true
    } as const
  }
];
