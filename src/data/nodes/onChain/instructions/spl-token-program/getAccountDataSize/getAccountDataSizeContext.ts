export const getAccountDataSizeContext = {
    data: {
      label: "Get Account Data Size Context",
      accounts: [
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint whose token account size is being retrieved",
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
  