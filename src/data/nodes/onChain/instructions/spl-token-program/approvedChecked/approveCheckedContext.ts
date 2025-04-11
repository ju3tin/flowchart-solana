export const approveCheckedContext = {
    data: {
      label: "ApproveChecked Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account authorized to approve a delegate",
          isWritable: false,
          isSigner: true,
        },
        {
          label: "Source Account",
          type: "Pubkey",
          description: "The token account whose tokens will be delegated",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The mint of the source account (checked against decimals)",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Delegate Account",
          type: "Pubkey",
          description: "The delegate who will be approved to spend tokens",
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
  