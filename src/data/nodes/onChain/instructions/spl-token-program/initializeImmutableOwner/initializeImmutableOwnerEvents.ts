export const initializeImmutableOwnerEvents = {
    data: {
      label: "Initialize Immutable Owner Events",
      events: [
        {
          name: "ImmutableOwnerInitialized",
          description: "Emitted when an account's ownership is successfully made immutable",
          fields: [
            { name: "account", type: "pubkey" },
          ],
        },
      ],
    },
  };
  