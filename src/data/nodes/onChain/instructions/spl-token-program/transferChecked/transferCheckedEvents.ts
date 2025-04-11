export const transferCheckedEvents = {
    data: {
      label: "TransferChecked Events",
      events: [
        {
          name: "TransferCheckedCompleted",
          description: "Emitted when a token transfer is performed with decimals checked",
          fields: [
            { name: "source", type: "pubkey" },
            { name: "destination", type: "pubkey" },
            { name: "amount", type: "u64" },
            { name: "decimals", type: "u8" },
          ],
        },
      ],
    },
  };
  