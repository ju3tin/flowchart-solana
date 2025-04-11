import { FlowNode } from "../utils/flowInterfaces";

export const systemProgramNode: FlowNode = {
  id: "system-program",
  type: "accountNode",
  position: { x: -400, y: 350 },
  data: {
    label: "System Program",
    fields: [
      { label: "Program ID", type: "Pubkey", value: "11111111111111111111111111111111" },
    ],
  },
};
