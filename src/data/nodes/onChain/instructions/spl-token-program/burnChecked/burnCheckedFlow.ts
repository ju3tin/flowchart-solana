import { burnCheckedCode } from "./code/burnCheckedCode";
import { burnCheckedContext } from "./burnCheckedContext";
import { burnCheckedInput } from "./burnCheckedInput";
import { burnCheckedErrorCodes } from "./burnCheckedErrorCodes";
import { burnCheckedEvents } from "./burnCheckedEvents";

const contextData = burnCheckedContext.data.accounts || [];
const inputsData = burnCheckedInput.data.fields || [];
const errorCodesData = burnCheckedErrorCodes.data.codes || [];
const eventsData = burnCheckedEvents.data.events || [];

export const burnCheckedFlow = {
  name: "Burn Checked Flow",
  nodes: [
    {
      id: "burn-checked-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Burn Checked",
        description: "Burns tokens from a token account, enforcing the mint's decimals.",
        code: burnCheckedCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
