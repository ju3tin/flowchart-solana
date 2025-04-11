export const uiAmountToAmountContext = {
    data: {
      label: "UiAmountToAmount Context",
      accounts: [
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint whose decimals are used for the conversion",
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
  