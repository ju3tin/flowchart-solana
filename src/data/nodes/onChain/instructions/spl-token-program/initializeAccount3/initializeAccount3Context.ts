export const initializeAccount3Context = {
    data: {
      label: "Initialize Account3 Context",
      accounts: [
        {
          label: "Token Account",
          type: "Pubkey",
          description: "The token account to be initialized",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint associated with the token account",
          isWritable: false,
          isSigner: false,
        },
        {
          label: "Owner",
          type: "Pubkey",
          description: "The owner of the token account",
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
  