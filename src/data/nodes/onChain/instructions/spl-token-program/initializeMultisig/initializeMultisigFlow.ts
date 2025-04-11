import { initializeMultisigCode } from "./code/initializeMultisigCode";
import { initializeMultisigContext } from "./initializeMultisigContext";
import { initializeMultisigInput } from "./initializeMultisigInput";
import { initializeMultisigErrorCodes } from "./initializeMultisigErrorCodes";
import { initializeMultisigEvents } from "./initializeMultisigEvents";

const contextData = initializeMultisigContext.data.accounts || [];
const inputsData = initializeMultisigInput.data.fields || [];
const errorCodesData = initializeMultisigErrorCodes.data.codes || [];
const eventsData = initializeMultisigEvents.data.events || [];

export const initializeMultisigFlow = {
  name: "Initialize Multisig Flow",
  nodes: [
    {
      id: "initialize-multisig-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Multisig",
        description: "Initializes a new multisig account with a given set of signers and threshold.",
        code: initializeMultisigCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
