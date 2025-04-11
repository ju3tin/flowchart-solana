import { closeAccountCode } from "./code/closeAccountCode";
import { closeAccountContext } from "./closeAccountContext";
import { closeAccountInput } from "./closeAccountInput";
import { closeAccountErrorCodes } from "./closeAccountErrorCodes";
import { closeAccountEvents } from "./closeAccountEvents";

const contextData = closeAccountContext.data.accounts || [];
const inputsData = closeAccountInput.data.fields || [];
const errorCodesData = closeAccountErrorCodes.data.codes || [];
const eventsData = closeAccountEvents.data.events || [];

export const closeAccountFlow = {
  name: "Close Token Account Flow",
  nodes: [
    {
      id: "close-account-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Close Account",
        description: "Closes a token account, transferring any remaining SOL to a destination account.",
        code: closeAccountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
