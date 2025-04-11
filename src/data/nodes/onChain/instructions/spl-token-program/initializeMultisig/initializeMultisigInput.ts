export const initializeMultisigInput = {
    data: {
      label: "Inputs",
      fields: [
        {
          label: "Signers",
          type: "pubkey[]",
          value: [],
        },
        {
          label: "Threshold (m)",
          type: "u8",
          value: "2",
        },
      ],
    },
  };
  