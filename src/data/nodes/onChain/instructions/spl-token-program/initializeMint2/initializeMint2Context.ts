export const initializeMint2Context = {
    data: {
      label: "Initialize Mint2 Context",
      accounts: [
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint account to initialize",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint Authority",
          type: "Pubkey",
          description: "The authority allowed to mint tokens",
          isWritable: false,
          isSigner: true,
        },
        {
          label: "Token Program",
          type: "Program",
          description: "SPL Token program",
        },
      ],
    },
  };
  