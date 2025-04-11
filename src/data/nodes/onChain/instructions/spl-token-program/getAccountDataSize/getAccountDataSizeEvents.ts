export const getAccountDataSizeEvents = {
    data: {
      label: "Get Account Data Size Events",
      events: [
        {
          name: "AccountDataSizeRequested",
          description: "Emitted when a request for account data size is initiated",
          fields: [
            { name: "mint", type: "pubkey" },
          ],
        },
      ],
    },
  };
  