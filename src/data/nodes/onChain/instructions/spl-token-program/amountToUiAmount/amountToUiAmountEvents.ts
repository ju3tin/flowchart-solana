export const amountToUiAmountEvents = {
    data: {
      label: "AmountToUiAmount Events",
      events: [
        {
          name: "AmountToUiAmountCompleted",
          description: "Emitted after converting an amount to UI format",
          fields: [
            { name: "mint", type: "pubkey" },
            { name: "amount", type: "u64" },
          ],
        },
      ],
    },
  };
  