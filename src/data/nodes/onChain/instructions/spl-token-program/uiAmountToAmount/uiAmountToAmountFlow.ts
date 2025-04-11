import { uiAmountToAmountCode } from "./code/uiAmountToAmountCode";
import { uiAmountToAmountContext } from "./uiAmountToAmountContext";
import { uiAmountToAmountInput } from "./uiAmountToAmountInput";
import { uiAmountToAmountErrorCodes } from "./uiAmountToAmountErrorCodes";
import { uiAmountToAmountEvents } from "./uiAmountToAmountEvents";

const contextData = uiAmountToAmountContext.data.accounts || [];
const inputsData = uiAmountToAmountInput.data.fields || [];
const errorCodesData = uiAmountToAmountErrorCodes.data.codes || [];
const eventsData = uiAmountToAmountEvents.data.events || [];

export const uiAmountToAmountFlow = {
  name: "Ui Amount To Amount Flow",
  nodes: [
    {
      id: "ui-amount-to-amount-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "UiAmountToAmount",
        description: "Converts a UI-friendly decimal string into base token units based on the mint’s decimals.",
        code: uiAmountToAmountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
