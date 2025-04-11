export const thawAccountContext = {
    data: {
      label: "Thaw Account Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The freeze authority permitted to thaw token accounts",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The frozen token account to thaw",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint that has the freeze authority",
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
  