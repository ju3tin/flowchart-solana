export const syncNativeEvents = {
    data: {
      label: "Sync Native Events",
      events: [
        {
          name: "NativeSynced",
          description: "Emitted when the native SOL account is successfully synced",
          fields: [
            { name: "account", type: "pubkey" },
          ],
        },
      ],
    },
  };
  