// mintNftNodeData.ts
export const mintNftNode = {
  type: "mintNftNode",
  data: {
    label: "Mint NFT",
    functionName: "mintNft",
    parameters: [
      { 
        label: "NFT Metadata URI", 
        description: "IPFS or other URI to the NFT metadata", 
        required: true 
      },
      { 
        label: "Recipient", 
        description: "Wallet address that will receive the NFT (defaults to connected wallet)" 
      },
      { 
        label: "Quantity", 
        description: "Number of editions to mint", 
        type: "number",
        value: 1
      },
      { 
        label: "Is Mutable", 
        description: "Whether the NFT can be updated after minting",
        type: "boolean",
        value: true
      }
    ],
  },
  position: { x: 0, y: 0 },
}; 