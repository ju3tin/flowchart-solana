import { burnCode } from "./code/burnCode";
import { burnContext } from "./burnContext";
import { burnInput } from "./burnInput";
import { burnErrorCodes } from "./burnErrorCodes";
import { burnEvents } from "./burnEvents";

const contextData = burnContext.data.accounts || [];
const inputsData = burnInput.data.fields || [];
const errorCodesData = burnErrorCodes.data.codes || [];
const eventsData = burnEvents.data.events || [];

export const burnFlow = {
  name: "Burn Tokens Flow",
  nodes: [
    {
      id: "burn-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Burn SPL Tokens",
        description: "Burns a specified amount of tokens from a token account.",
        code: burnCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
