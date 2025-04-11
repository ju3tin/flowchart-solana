import { thawAccountCode } from "./code/thawAccountCode";
import { thawAccountContext } from "./thawAccountContext";
import { thawAccountInput } from "./thawAccountInput";
import { thawAccountErrorCodes } from "./thawAccountErrorCodes";
import { thawAccountEvents } from "./thawAccountEvents";

const contextData = thawAccountContext.data.accounts || [];
const inputsData = thawAccountInput.data.fields || [];
const errorCodesData = thawAccountErrorCodes.data.codes || [];
const eventsData = thawAccountEvents.data.events || [];

export const thawAccountFlow = {
  name: "Thaw Account Flow",
  nodes: [
    {
      id: "thaw-account-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Thaw Account",
        description: "Thaws a previously frozen token account, restoring the ability to transfer tokens.",
        code: thawAccountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
