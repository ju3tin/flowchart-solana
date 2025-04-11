export const transferContext = {
    id: "transfer-context",
    type: "contextNode",
    position: { x: -600, y: 0 },
    data: {
      label: "Transfer Tokens Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The account authorized to transfer tokens",
          isWritable: false,
          isSigner: true,
        },
        {
          label: "Source Account",
          type: "Pubkey",
          description: "The token account to transfer from",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Destination Account",
          type: "Pubkey",
          description: "The token account to transfer to",
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
  