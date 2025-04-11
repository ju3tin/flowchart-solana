export const transferErrorCodes = {
    id: "transfer-error-codes",
    type: "errorCodesNode",
    position: { x: 400, y: 0 },
    data: {
      label: "Transfer Error Codes",
      codes: [
        {
          name: "InsufficientFunds",
          description: "Insufficient funds in source account.",
        },
        {
          name: "Unauthorized",
          description: "Unauthorized transfer attempt.",
        },
      ],
    },
  };
  