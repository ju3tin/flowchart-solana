export const initializeAccount3Events = {
    data: {
      label: "Initialize Account3 Events",
      events: [
        {
          name: "Account3Initialized",
          description: "Emitted when the account is initialized using initialize_account3",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
            { name: "owner", type: "pubkey" },
          ],
        },
      ],
    },
  };
  