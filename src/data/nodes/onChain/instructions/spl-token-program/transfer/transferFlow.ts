import { transferCode } from "./code/transferCode";
import { transferContext } from "./transferContext";
import { transferInput } from "./transferInput";
import { transferErrorCodes } from "./transferErrorCodes";
import { transferEvents } from "./transferEvents";

const contextData = transferContext.data.accounts || [];
const inputsData = transferInput.data.fields || [];
const errorCodesData = transferErrorCodes.data.codes || [];
const eventsData = transferEvents.data.events || [];

export const transferFlow = {
  name: "Transfer Tokens Flow",
  nodes: [
    {
      id: "transfer-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Transfer SPL Tokens",
        description: "Transfers tokens from a source account to a destination account.",
        code: transferCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
