export const burnContext = {
    data: {
      label: "Burn Tokens Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account authorized to burn tokens",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The token account from which tokens are burned",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint to which these tokens belong",
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
  