export const approveCheckedEvents = {
    data: {
      label: "ApproveChecked Events",
      events: [
        {
          name: "ApprovalCheckedGranted",
          description: "Emitted when a delegate is successfully approved with decimals checked",
          fields: [
            { name: "source", type: "pubkey" },
            { name: "delegate", type: "pubkey" },
            { name: "amount", type: "u64" },
            { name: "decimals", type: "u8" },
          ],
        },
      ],
    },
  };
  