import { initAccountCode } from "./code/initAccountCode";
import { initAccountContext } from "./initAccountContext";
import { initAccountInput } from "./initAccountInput";
import { initAccountErrorCodes } from "./initAccountErrorCodes";
import { initAccountEvents } from "./initAccountEvents";

const contextData = initAccountContext.data.accounts || [];
const inputsData = initAccountInput.data.fields || [];
const errorCodesData = initAccountErrorCodes.data.codes || [];
const eventsData = initAccountEvents.data.events || [];

export const initAccountFlow = {
  name: "Initialize Account Flow",
  nodes: [
    {
      id: "init-account-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Token Account",
        description: "Creates and initializes a new token account for the given mint and owner.",
        code: initAccountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
