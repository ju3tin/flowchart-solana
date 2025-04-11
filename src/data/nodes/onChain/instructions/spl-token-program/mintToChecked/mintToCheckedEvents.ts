export const mintToCheckedEvents = {
    data: {
      label: "MintToChecked Events",
      events: [
        {
          name: "TokensMintedChecked",
          description: "Emitted when tokens are minted with the decimals checked",
          fields: [
            { name: "mint", type: "pubkey" },
            { name: "destination", type: "pubkey" },
            { name: "amount", type: "u64" },
            { name: "decimals", type: "u8" },
          ],
        },
      ],
    },
  };
  