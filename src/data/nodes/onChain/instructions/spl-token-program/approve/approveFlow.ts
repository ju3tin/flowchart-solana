import { approveCode } from "./code/approveCode";
import { approveContext } from "./approveContext";
import { approveInput } from "./approveInput";
import { approveErrorCodes } from "./approveErrorCodes";
import { approveEvents } from "./approveEvents";

const contextData = approveContext.data.accounts || [];
const inputsData = approveInput.data.fields || [];
const errorCodesData = approveErrorCodes.data.codes || [];
const eventsData = approveEvents.data.events || [];

export const approveFlow = {
  name: "Approve Delegate Flow",
  nodes: [
    {
      id: "approve-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Approve Delegate",
        description: "Approve a delegate to spend tokens from a source account.",
        code: approveCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
