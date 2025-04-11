export const mintAuthorityAccountNode = {
    id: 'mint-authority',
    type: 'accountNode',
    position: { x: -400, y: 200 },
    data: {
      label: 'Mint Authority',
      fields: [
        { label: 'Address', type: 'Pubkey', value: 'not set' },
        { label: 'PDA', type: 'Pubkey', value: 'false' }, // make this bool into a switch
      ],
    },
  };
  