export const isValidSignerIndexEvents = {
    data: {
      label: "Is Valid Signer Index Events",
      events: [
        {
          name: "SignerIndexCheckResult",
          description: "Emitted after checking if a given signer index is valid",
          fields: [
            { name: "index", type: "usize" },
            { name: "valid", type: "bool" },
          ],
        },
      ],
    },
  };
  