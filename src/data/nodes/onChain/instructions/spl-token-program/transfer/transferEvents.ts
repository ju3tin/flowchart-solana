export const transferEvents = {
    id: "transfer-events",
    type: "eventsNode",
    position: { x: 400, y: 160 },
    data: {
      label: "Transfer Events",
      events: [
        {
          name: "TransferCompleted",
          description: "Emitted when a token transfer is successfully completed",
          fields: [
            { name: "source", type: "pubkey" },
            { name: "destination", type: "pubkey" },
            { name: "amount", type: "u64" },
          ],
        },
      ],
    },
  };
  