export const initMintContextNode = {
    id: "init-mint-context",
    type: "contextNode",
    position: { x: -600, y: 0 }, // adjust as you like
    data: {
      label: "Initialize Mint Context",
      accounts: [
        {
          label: "Mint Account",
          type: "Pubkey",
          description: "The mint account to initialize",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Mint Authority",
          type: "Pubkey",
          description: "The authority who can mint new tokens",
          isWritable: false,
          isSigner: true,
        },
        {
          label: "Payer",
          type: "Pubkey",
          description: "The account paying for the transaction",
          isWritable: true,
          isSigner: true,
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
  