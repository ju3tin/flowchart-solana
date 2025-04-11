export const initializeMint2Events = {
    data: {
      label: "Initialize Mint2 Events",
      events: [
        {
          name: "Mint2Initialized",
          description: "Emitted when the mint is initialized with initialize_mint2",
          fields: [
            { name: "mint", type: "pubkey" },
            { name: "mint_authority", type: "pubkey" },
            { name: "freeze_authority", type: "pubkey | null" },
            { name: "decimals", type: "u8" },
          ],
        },
      ],
    },
  };
  