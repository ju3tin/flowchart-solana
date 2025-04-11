export const burnCheckedEvents = {
    data: {
      label: "BurnChecked Events",
      events: [
        {
          name: "BurnCheckedCompleted",
          description: "Emitted when tokens are successfully burned with decimal checks",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
            { name: "amount", type: "u64" },
            { name: "decimals", type: "u8" },
          ],
        },
      ],
    },
  };
  