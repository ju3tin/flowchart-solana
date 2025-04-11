import { createFlowNode } from "../utils/nodeFactory";

export const mintAccountNode = createFlowNode({
    id: 'mint-account',
    type: 'accountNode',
    position: { x: -400, y: 0 },
    data: {
      label: 'Mint Account',
      fields: [
        { label: 'Public Key', type: 'Pubkey', value: 'not set' },
        { label: 'Decimals', type: 'u8', value: '9' },
        { label: 'Mint Authority', type: 'Pubkey', value: 'not set' },
        { label: 'Freeze Authority', type: 'Pubkey', value: 'not set' },
        { label: 'Supply', type: 'u64', value: '0' },
      ],
    },
  });
  