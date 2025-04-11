export const mintToCheckedContext = {
    data: {
      label: "MintToChecked Context",
      accounts: [
        {
          label: "Authority",
          type: "Pubkey",
          description: "The authority who can mint tokens",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Mint",
          type: "Pubkey",
          description: "The token mint to produce new tokens from",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Destination Account",
          type: "Pubkey",
          description: "The token account to receive newly minted tokens",
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
  