export const initAccountContext = {
  data: {
    label: "Initialize Account Context",
    accounts: [
      {
        label: "Payer",
        type: "Pubkey",
        description: "The account paying for the transaction",
        isWritable: true,
        isSigner: true,
      },
      {
        label: "Token Account",
        type: "Pubkey",
        description: "The new token account to be created and initialized",
        isWritable: true,
        isSigner: false,
      },
      {
        label: "Token Mint",
        type: "Pubkey",
        description: "The mint to associate with this token account",
        isWritable: false,
        isSigner: false,
      },
      {
        label: "System Program",
        type: "Program",
        description: "System program",
      },
      {
        label: "Token Program",
        type: "Program",
        description: "Token program",
      },
      {
        label: "Rent Sysvar",
        type: "Sysvar",
        description: "Rent sysvar",
      },
    ],
  },
};
