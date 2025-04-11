export const initMintErrorCodesNode = {
    data: {
      label: "Initialize Mint Error Codes",
      description: "Common error variants that can occur when initializing a new token mint account.",
      codes: [
        {
          name: "MintNotOwnedByTokenProgram",
          message: "Mint account is not owned by the Token Program.",
        },
        {
          name: "DestinationNotOwnedByTokenProgram",
          message: "Destination account is not owned by the Token Program.",
        },
        {
          name: "InvalidDecimalsValue",
          message: "Decimals value must be between 0 and 9",
        },
      ],
    },
  };
  