import { getAccountDataSizeCode } from "./code/getAccountDataSizeCode";
import { getAccountDataSizeContext } from "./getAccountDataSizeContext";
import { getAccountDataSizeInput } from "./getAccountDataSizeInput";
import { getAccountDataSizeErrorCodes } from "./getAccountDataSizeErrorCodes";
import { getAccountDataSizeEvents } from "./getAccountDataSizeEvents";

const contextData = getAccountDataSizeContext.data.accounts || [];
const inputsData = getAccountDataSizeInput.data.fields || [];
const errorCodesData = getAccountDataSizeErrorCodes.data.codes || [];
const eventsData = getAccountDataSizeEvents.data.events || [];

export const getAccountDataSizeFlow = {
  name: "Get Account Data Size Flow",
  nodes: [
    {
      id: "get-account-data-size-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Get Account Data Size",
        description: "Retrieves the required size for token account data, based on the mint.",
        code: getAccountDataSizeCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
