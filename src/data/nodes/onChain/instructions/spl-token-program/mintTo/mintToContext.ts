export const mintToContext = {
    data: {
      accounts: [
        {
          label: "Mint Authority",
          type: "AccountInfo",
          description: "Signer authorized to mint tokens",
          isWritable: true,
          isSigner: true,
        },
        {
          label: "Token Mint",
          type: "AccountInfo",
          description: "The token mint from which tokens will be minted",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Destination Token Account",
          type: "AccountInfo",
          description: "The token account receiving the newly minted tokens",
          isWritable: true,
          isSigner: false,
        },
        {
          label: "Token Program",
          type: "Program",
          description: "The SPL Token program",
          isWritable: false,
          isSigner: false,
        },
      ],
    },
  };
  