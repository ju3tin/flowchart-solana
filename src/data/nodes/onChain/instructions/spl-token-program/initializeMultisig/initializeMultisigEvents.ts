export const initializeMultisigEvents = {
    data: {
      label: "Initialize Multisig Events",
      events: [
        {
          name: "MultisigInitialized",
          description: "Emitted when the multisig account is successfully initialized",
          fields: [
            { name: "multisig", type: "pubkey" },
            { name: "signer_pubkeys", type: "pubkey[]" },
            { name: "threshold", type: "u8" },
          ],
        },
      ],
    },
  };
  