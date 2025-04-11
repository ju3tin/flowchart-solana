export interface InstructionConfig {
    use_pda: boolean;
    mint_type: "fungible" | "nft";
    mint_authority: string;
    freeze_authority?: string;
    decimals?: number;
    supply?: number;
  
    // NFT-Specific Metadata
    name?: string;
    symbol?: string;
    uri?: string;
  
    // Additional NFT Metadata (Metaplex Standards)
    seller_fee_basis_points?: number;
    creators?: { address: string; share: number }[];
    collection?: { address: string; verified: boolean };
    attributes?: { trait_type: string; value: string }[];
    is_mutable?: boolean;
  }
  

export interface InstructionData {
  label: string;
  context: { label: string; value: string }[];
  inputs: { label: string; value: string }[];
  outputs: { label: string; value: string }[];
  code: string;
  configuration: InstructionConfig;
}

export interface ParentInstructionData {
  label: string;
  inputs: { label: string; value: string }[];
  outputs?: { label: string; value: string }[];
  code: string;
  configuration: InstructionConfig;
}