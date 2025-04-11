export const uiAmountToAmountEvents = {
    data: {
      label: "UiAmountToAmount Events",
      events: [
        {
          name: "UiAmountToAmountRequested",
          description: "Emitted when a UI amount is converted to a base amount on-chain",
          fields: [
            { name: "mint", type: "pubkey" },
            { name: "ui_amount", type: "string" },
          ],
        },
      ],
    },
  };
  