import { freezeAccountCode } from "./code/freezeAccountCode";
import { freezeAccountContext } from "./freezeAccountContext";
import { freezeAccountInput } from "./freezeAccountInput";
import { freezeAccountErrorCodes } from "./freezeAccountErrorCodes";
import { freezeAccountEvents } from "./freezeAccountEvents";

const contextData = freezeAccountContext.data.accounts || [];
const inputsData = freezeAccountInput.data.fields || [];
const errorCodesData = freezeAccountErrorCodes.data.codes || [];
const eventsData = freezeAccountEvents.data.events || [];

export const freezeAccountFlow = {
  name: "Freeze Account Flow",
  nodes: [
    {
      id: "freeze-account-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Freeze Account",
        description: "Freezes a token account, preventing transfers until thawed by the freeze authority.",
        code: freezeAccountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
