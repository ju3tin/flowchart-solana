import { initializeMultisig2Code } from "./code/initializeMultisig2Code";
import { initializeMultisig2Context } from "./initializeMultisig2Context";
import { initializeMultisig2Input } from "./initializeMultisig2Input";
import { initializeMultisig2ErrorCodes } from "./initializeMultisig2ErrorCodes";
import { initializeMultisig2Events } from "./initializeMultisig2Events";

const contextData = initializeMultisig2Context.data.accounts || [];
const inputsData = initializeMultisig2Input.data.fields || [];
const errorCodesData = initializeMultisig2ErrorCodes.data.codes || [];
const eventsData = initializeMultisig2Events.data.events || [];

export const initializeMultisig2Flow = {
  name: "Initialize Multisig2 Flow",
  nodes: [
    {
      id: "initialize-multisig2-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Multisig2",
        description: "Initializes a multisig account with a specified set of signers and threshold (m).",
        code: initializeMultisig2Code,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
