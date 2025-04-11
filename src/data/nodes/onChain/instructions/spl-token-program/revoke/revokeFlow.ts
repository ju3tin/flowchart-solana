import { revokeCode } from "./code/revokeCode";
import { revokeContext } from "./revokeContext";
import { revokeInput } from "./revokeInput";
import { revokeErrorCodes } from "./revokeErrorCodes";
import { revokeEvents } from "./revokeEvents";

const contextData = revokeContext.data.accounts || [];
const inputsData = revokeInput.data.fields || [];
const errorCodesData = revokeErrorCodes.data.codes || [];
const eventsData = revokeEvents.data.events || [];

export const revokeFlow = {
  name: "Revoke Delegate Flow",
  nodes: [
    {
      id: "revoke-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Revoke",
        description: "Revokes a delegate's authority to spend or manage tokens on behalf of the source account.",
        code: revokeCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
