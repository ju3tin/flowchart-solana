export const thawAccountEvents = {
    data: {
      label: "Thaw Account Events",
      events: [
        {
          name: "AccountThawed",
          description: "Emitted when a token account is successfully thawed",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
          ],
        },
      ],
    },
  };
  