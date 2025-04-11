export const initAccountEvents = {
  data: {
    label: "Initialize Account Events",
    events: [
      {
        name: "AccountInitialized",
        description: "Emitted when a token account is initialized",
        fields: [
          { name: "account", type: "pubkey" },
          { name: "owner", type: "pubkey" },
        ],
      },
    ],
  },
};
