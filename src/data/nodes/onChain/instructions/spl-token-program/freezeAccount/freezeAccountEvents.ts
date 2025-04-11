export const freezeAccountEvents = {
    data: {
      label: "Freeze Account Events",
      events: [
        {
          name: "AccountFrozen",
          description: "Emitted when a token account is successfully frozen",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
          ],
        },
      ],
    },
  };
  