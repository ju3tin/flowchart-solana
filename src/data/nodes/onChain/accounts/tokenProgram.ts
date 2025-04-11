import { FlowNode } from "../utils/flowInterfaces";

export const tokenProgramNode: FlowNode = {
  id: "token-program",
  type: "accountNode",
  position: { x: -400, y: 300 },
  data: {
    label: "Token Program",
    fields: [
      { label: "Program ID", type: "Pubkey", value: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    ],
  },
};
