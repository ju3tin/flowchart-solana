export const initMintEventsNode = {
  id: "init-mint-events",
  type: "eventsNode",
  position: { x: 400, y: 160 },
  data: {
    label: "Initialize Mint Events",
    events: [
      {
        name: "MintInitialized",
        description: "Emitted when a new mint is initialized",
        fields: [
          { name: "mint", type: "pubkey" },
          { name: "decimals", type: "u8" },
        ],
      },
    ],
  },
};