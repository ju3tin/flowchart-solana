import { amountToUiAmountCode } from "./code/amountToUiAmountCode";
import { amountToUiAmountContext } from "./amountToUiAmountContext";
import { amountToUiAmountInput } from "./amountToUiAmountInput";
import { amountToUiAmountErrorCodes } from "./amountToUiAmountErrorCodes";
import { amountToUiAmountEvents } from "./amountToUiAmountEvents";

const contextData = amountToUiAmountContext.data.accounts || [];
const inputsData = amountToUiAmountInput.data.fields || [];
const errorCodesData = amountToUiAmountErrorCodes.data.codes || [];
const eventsData = amountToUiAmountEvents.data.events || [];

export const amountToUiAmountFlow = {
  name: "Amount to UI Amount Flow",
  nodes: [
    {
      id: "amount_to_ui_amount",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Amount to UI Amount",
        description: "Converts a raw token amount into a UI-friendly amount, based on the mint's decimals.",
        code: amountToUiAmountCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
