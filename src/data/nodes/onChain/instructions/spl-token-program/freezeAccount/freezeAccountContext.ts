export const freezeAccountContext = {
    data: {
      label: "Freeze Account Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account that is allowed to freeze tokens (freeze authority)",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The token account to be frozen",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint associated with the token account",
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
  