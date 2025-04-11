export const initializeMultisig2Context = {
    data: {
      label: "Initialize Multisig2 Context",
      accounts: [
        {
          label: "Multisig Account",
          type: "Pubkey",
          description: "The account to be initialized as a multisig (rent-exempt)",
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
  