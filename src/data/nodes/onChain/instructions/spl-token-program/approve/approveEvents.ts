export const approveEvents = {
    data: {
      label: "Approve Events",
      events: [
        {
          name: "ApprovalGranted",
          description: "Emitted when a delegate is successfully approved",
          fields: [
            { name: "source", type: "pubkey" },
            { name: "delegate", type: "pubkey" },
            { name: "amount", type: "u64" },
          ],
        },
      ],
    },
  };
  