export const transferCheckedContext = {
    data: {
      label: "TransferChecked Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account authorized to move tokens out of the source account",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Source Account",
          type: "Pubkey",
          description: "The token account from which tokens are transferred",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint of the tokens being transferred (checked for correct decimals)",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Destination Account",
          type: "Pubkey",
          description: "The token account receiving the tokens",
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
  