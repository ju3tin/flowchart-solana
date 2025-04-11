export const initializeImmutableOwnerContext = {
    data: {
      label: "Initialize Immutable Owner Context",
      accounts: [
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The token account to make ownership immutable",
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
  