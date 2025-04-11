import { FlowNode } from "../utils/flowInterfaces";

export const payerAccountNode: FlowNode = {
  id: "payer-account",
  type: "accountNode",
  position: { x: -400, y: 200 },
  data: {
    label: "Payer Account",
    fields: [
      { label: "Address", type: "Pubkey", value: 'not set' },
      { label: "isSigner?", type: "bool", value: "true" }, //
    ],
  },
};
