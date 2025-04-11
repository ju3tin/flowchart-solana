export const revokeEvents = {
    data: {
      label: "Revoke Events",
      events: [
        {
          name: "DelegateRevoked",
          description: "Emitted when a delegate is successfully revoked",
          fields: [
            { name: "source", type: "pubkey" },
            { name: "owner", type: "pubkey" },
          ],
        },
      ],
    },
  };
  