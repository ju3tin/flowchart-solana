export const closeAccountContext = {
    data: {
      label: "Close Account Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account authorized to close the token account",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The token account to be closed",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Destination",
          type: "Pubkey",
          description: "The recipient of any remaining SOL from the closed account",
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
  