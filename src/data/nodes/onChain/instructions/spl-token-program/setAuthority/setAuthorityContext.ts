export const setAuthorityContext = {
    data: {
      label: "Set Authority Context",
      accounts: [
        {
          label: "Current Authority",
          type: "Pubkey",
          description: "The existing authority who can reassign or remove the account's authority",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Owned Account or Mint",
          type: "Pubkey",
          description: "The token account or mint whose authority is changed",
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
  