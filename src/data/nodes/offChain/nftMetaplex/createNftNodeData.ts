// createNftNodeData.ts
import { placeholder } from "./apps/code/nft/createNftAccountsUtils";


export const createNftNode = {
  type: "createNftNode",
  data: {
    label: "Create NFT Accounts",
    functionName: "createNft",
    parameters: [
      { label: "Name", description: "Name of the NFT", required: true },
      { label: "Symbol", description: "Token symbol for the NFT", required: true },
      { label: "URI", description: "URI for the NFT metadata", required: true },
      { label: "Royalty Percentage", description: "Percentage of royalties (e.g. 500 for 5%)", type: "number" },
      { label: "Collection Address", description: "Public key of the collection" },
      { label: "Creators", description: "JSON array of creators with shares", type: "textarea" },
    ],
    outputFields: {
      transactionSignature: {
        label: "Transaction Signature",
        type: "string"
      },
      accounts: {
        label: "Accounts Created",
        fields: {
          mintAccount: {
            label: "Mint Account",
            type: "string"
          },
          metadataAccount: {
            label: "Metadata Account",
            type: "string"
          },
          associatedTokenAccount: {
            label: "Associated Token Account", 
            type: "string"
          }
        }
      },
      authorities: {
        label: "Authorities",
        fields: {
          mintAuthority: {
            label: "Mint Authority",
            type: "string"
          },
          freezeAuthority: {
            label: "Freeze Authority",
            type: "string"
          },
          updateAuthority: {
            label: "Update Authority",
            type: "string"
          }
        }
      }
    },
    
    // The key piece: We provide the function that OffChainFunctionNode will call when the user hits "run"
    runFunction: placeholder,
  },
  position: { x: 0, y: 0 },
};
  