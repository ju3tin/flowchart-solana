export const closeAccountErrorCodes = {
    data: {
      label: "Close Account Error Codes",
      codes: [
        {
          name: "NonEmptyAccount",
          message: "Account cannot be closed because it still contains tokens.",
        },
        {
          name: "Unauthorized",
          message: "Unauthorized attempt to close the account.",
        },
      ],
    },
  };
  