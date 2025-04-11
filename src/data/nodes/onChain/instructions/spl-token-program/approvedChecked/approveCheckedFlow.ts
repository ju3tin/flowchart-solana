import { approveCheckedCode } from "./code/approveCheckedCode";
import { approveCheckedContext } from "./approveCheckedContext";
import { approveCheckedInput } from "./approveCheckedInput";
import { approveCheckedErrorCodes } from "./approveCheckedErrorCodes";
import { approveCheckedEvents } from "./approveCheckedEvents";

const contextData = approveCheckedContext.data.accounts || [];
const inputsData = approveCheckedInput.data.fields || [];
const errorCodesData = approveCheckedErrorCodes.data.codes || [];
const eventsData = approveCheckedEvents.data.events || [];

export const approveCheckedFlow = {
  name: "Approve Checked Flow",
  nodes: [
    {
      id: "approve-checked-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Approve Checked",
        description: "Approves a delegate with mint decimals enforced, ensuring correct token amounts.",
        code: approveCheckedCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
