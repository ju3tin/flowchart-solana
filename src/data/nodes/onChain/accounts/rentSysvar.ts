import { FlowNode } from "../utils/flowInterfaces";

export const rentSysvarNode: FlowNode = {
  id: "rent-sysvar",
  type: "accountNode",
  position: { x: -400, y: 250 },
  data: {
    label: "Rent Sysvar",
    fields: [
      {
        label: "Sysvar Address",
        type: "Pubkey",
        value: "SysvarRent111111111111111111111111111111111",
      },
    ],
  },
};
