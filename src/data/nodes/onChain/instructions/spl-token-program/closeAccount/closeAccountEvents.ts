export const closeAccountEvents = {
    data: {
      label: "Close Account Events",
      events: [
        {
          name: "AccountClosed",
          description: "Emitted when the token account is successfully closed",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "destination", type: "pubkey" },
          ],
        },
      ],
    },
  };
  