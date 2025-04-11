export const amountToUiAmountContext = {
    data: {
      label: "Amount to UI Amount Context",
      accounts: [
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint whose decimal scaling is used",
          isWritable: false,
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
  