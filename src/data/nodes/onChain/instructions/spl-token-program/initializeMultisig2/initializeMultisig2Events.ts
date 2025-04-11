export const initializeMultisig2Events = {
    data: {
      label: "Initialize Multisig2 Events",
      events: [
        {
          name: "Multisig2Initialized",
          description: "Emitted when the multisig account is successfully initialized using initialize_multisig2",
          fields: [
            { name: "multisig", type: "pubkey" },
            { name: "signer_pubkeys", type: "pubkey[]" },
            { name: "threshold", type: "u8" },
          ],
        },
      ],
    },
  };
  