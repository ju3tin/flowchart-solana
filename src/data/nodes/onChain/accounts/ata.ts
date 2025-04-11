import { createFlowNode } from "../utils/nodeFactory";

export const ataNode = createFlowNode({
  id: "associated-token-account",
  type: "accountNode",
  data: {
    label: "Associated Token Account",
    fields: [
      { label: "ATA Pubkey", type: "Pubkey", value: "Pubkey" },
      { label: "Mint", type: "Pubkey", value: "Pubkey" },
      { label: "Owner", type: "Pubkey", value: "Pubkey" },
    ]
  },
});
