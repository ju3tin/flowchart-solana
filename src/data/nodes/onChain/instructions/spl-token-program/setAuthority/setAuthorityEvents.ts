export const setAuthorityEvents = {
    data: {
      label: "Set Authority Events",
      events: [
        {
          name: "AuthoritySet",
          description: "Emitted when the authority of an account or mint is successfully changed",
          fields: [
            { name: "owned", type: "pubkey" },
            { name: "new_authority", type: "pubkey | null" },
            { name: "authority_type", type: "u8" },
          ],
        },
      ],
    },
  };
  