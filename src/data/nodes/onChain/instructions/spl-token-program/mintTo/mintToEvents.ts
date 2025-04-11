export const mintToEvents = {
    data: {
      events: [
        {
          name: "MintToCompleted",
          description: "Fires after successful mint to an account.",
          fields: [
            { name: "mint", type: "publicKey" },
            { name: "destination", type: "publicKey" },
            { name: "amount", type: "u64" },
          ],
        },
      ],
    },
  };
  