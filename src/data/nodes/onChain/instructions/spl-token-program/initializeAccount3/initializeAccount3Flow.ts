import { initializeAccount3Code } from "./code/initializeAccount3Code";
import { initializeAccount3Context } from "./initializeAccount3Context";
import { initializeAccount3Input } from "./initializeAccount3Input";
import { initializeAccount3ErrorCodes } from "./initializeAccount3ErrorCodes";
import { initializeAccount3Events } from "./initializeAccount3Events";

const contextData = initializeAccount3Context.data.accounts || [];
const inputsData = initializeAccount3Input.data.fields || [];
const errorCodesData = initializeAccount3ErrorCodes.data.codes || [];
const eventsData = initializeAccount3Events.data.events || [];

export const initializeAccount3Flow = {
  name: "Initialize Account3 Flow",
  nodes: [
    {
      id: "initialize-account3-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Account3",
        description: "Initialize a token account without requiring it as a signer, using the new approach for account creation.",
        code: initializeAccount3Code,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
