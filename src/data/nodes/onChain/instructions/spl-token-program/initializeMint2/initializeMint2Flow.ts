import { initializeMint2Code } from "./code/initializeMint2Code";
import { initializeMint2Context } from "./initializeMint2Context";
import { initializeMint2Input } from "./initializeMint2Input";
import { initializeMint2ErrorCodes } from "./initializeMint2ErrorCodes";
import { initializeMint2Events } from "./initializeMint2Events";

const contextData = initializeMint2Context.data.accounts || [];
const inputsData = initializeMint2Input.data.fields || [];
const errorCodesData = initializeMint2ErrorCodes.data.codes || [];
const eventsData = initializeMint2Events.data.events || [];

export const initializeMint2Flow = {
  name: "Initialize Mint2 Flow",
  nodes: [
    {
      id: "initialize-mint2-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Mint2",
        description: "Initialize a new token mint using the SPL Token Program's initialize_mint2 instruction.",
        code: initializeMint2Code,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
