export const syncNativeContext = {
    data: {
      label: "SyncNative Context",
      accounts: [
        {
          label: "Native Account",
          type: "Pubkey",
          description: "The wrapped native SOL account to sync",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Token Program",
          type: "Program",
          description: "SPL Token program",
        },
      ],
    },
  };
  