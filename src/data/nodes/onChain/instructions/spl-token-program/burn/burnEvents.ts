export const burnEvents = {
    data: {
      label: "Burn Events",
      events: [
        {
          name: "BurnCompleted",
          description: "Emitted when tokens are successfully burned",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
            { name: "amount", type: "u64" },
          ],
        },
      ],
    },
  };
  