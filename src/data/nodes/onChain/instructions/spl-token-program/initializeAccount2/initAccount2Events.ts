export const initializeAccount2Events = {
    data: {
      label: "Initialize Account2 Events",
      events: [
        {
          name: "Account2Initialized",
          description: "Emitted when the account is initialized using initialize_account2",
          fields: [
            { name: "account", type: "pubkey" },
            { name: "mint", type: "pubkey" },
            { name: "owner", type: "pubkey" },
          ],
        },
      ],
    },
  };
  