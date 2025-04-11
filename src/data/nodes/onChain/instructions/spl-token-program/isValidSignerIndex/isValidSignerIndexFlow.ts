import { isValidSignerIndexCode } from "./code/isValidSignerIndexCode";
import { isValidSignerIndexContext } from "./isValidSignerIndexContext";
import { isValidSignerIndexInput } from "./isValidSignerIndexInput";
import { isValidSignerIndexErrorCodes } from "./isValidSignerIndexErrorCodes";
import { isValidSignerIndexEvents } from "./isValidSignerIndexEvents";

const contextData = isValidSignerIndexContext.data.accounts || [];
const inputsData = isValidSignerIndexInput.data.fields || [];
const errorCodesData = isValidSignerIndexErrorCodes.data.codes || [];
const eventsData = isValidSignerIndexEvents.data.events || [];

export const isValidSignerIndexFlow = {
  name: "Is Valid Signer Index Flow",
  nodes: [
    {
      id: "is-valid-signer-index-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Is Valid Signer Index",
        description: "Checks if a given signer index is within the allowable range of signers (e.g., 1..=11).",
        code: isValidSignerIndexCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
