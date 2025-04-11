import { mintTo } from "./mintTo";
import { mintToContext } from "./mintToContext";
import { mintToInput } from "./mintToInput";
import { mintToErrorCodes } from "./mintToErrorCodes";
import { mintToEvents } from "./mintToEvents";

const contextData = mintToContext.data.accounts || [];
const inputsData = mintToInput.data.fields || [];
const errorCodesData = mintToErrorCodes.data.codes || [];
const eventsData = mintToEvents.data.events || [];

export const mintToFlow = {
  name: "Mint To Flow",
  nodes: [
    {
      id: "mint-to-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        ...mintTo.data,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
