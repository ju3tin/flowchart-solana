import { initializeAccount2Code } from "./code/initAccount2Code";
import { initializeAccount2Context } from "./initAccount2Context";
import { initializeAccount2Input } from "./initializeAccount2Input";
import { initializeAccount2ErrorCodes } from "./initAccount2ErrorCodes";
import { initializeAccount2Events } from "./initAccount2Events";

const contextData = initializeAccount2Context.data.accounts || [];
const inputsData = initializeAccount2Input.data.fields || [];
const errorCodesData = initializeAccount2ErrorCodes.data.codes || [];
const eventsData = initializeAccount2Events.data.events || [];

export const initializeAccount2Flow = {
  name: "Initialize Account2 Flow",
  nodes: [
    {
      id: "initialize-account2-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Account2",
        description: "Initialize a token account without requiring the owner to be passed in as a signer on creation.",
        code: initializeAccount2Code,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
