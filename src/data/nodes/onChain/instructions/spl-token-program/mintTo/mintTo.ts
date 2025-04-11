import { mintToCode } from "./code/mintToCode";
import { createFlowNode } from "../../../utils/nodeFactory";

export const mintTo = createFlowNode({
    id: 'mint-to',
    type: 'instructionGroupNode',
    position: { x: 400, y: 0 },
    data: {
      label: 'Mint To',
      context: [
        { label: 'Mint Account', type: 'Pubkey', value: 'Pubkey', nodeId: 'mint-account_mint-to' },
        { label: 'Associated Token Account', type: 'Pubkey', value: 'Pubkey', nodeId: 'ata_mint-to' },
        { label: 'Mint Authority', type: 'Pubkey', value: 'Pubkey', nodeId: 'mint-auth-account_mint-to' },
        { label: 'Token Program', type: 'Pubkey', value: 'Pubkey', nodeId: 'token-program_mint-to' },
      ],
      inputs: [
        { label: 'Mint Amount', type: 'u64', value: 'u64', nodeId: 'mint-to-input-node' },
      ],
      outputs: [
      ],
      code: mintToCode,
    },
  });
  