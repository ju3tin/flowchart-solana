export const initializeMultisigContext = {
    data: {
      label: "Initialize Multisig Context",
      accounts: [
        {
          label: "Multisig Account",
          type: "Pubkey",
          description: "The account to be initialized as a multisig",
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
  