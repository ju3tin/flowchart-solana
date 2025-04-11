export const revokeContext = {
    data: {
      label: "Revoke Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The owner (or valid authority) of the source account",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Source Account",
          type: "Pubkey",
          description: "The token account whose delegate is revoked",
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
  