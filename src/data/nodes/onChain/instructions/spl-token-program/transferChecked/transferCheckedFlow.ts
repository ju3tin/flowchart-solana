import { transferCheckedCode } from "./code/transferCheckedCode";
import { transferCheckedContext } from "./transferCheckedContext";
import { transferCheckedInput } from "./transferCheckedInput";
import { transferCheckedErrorCodes } from "./transferCheckedErrorCodes";
import { transferCheckedEvents } from "./transferCheckedEvents";

const contextData = transferCheckedContext.data.accounts || [];
const inputsData = transferCheckedInput.data.fields || [];
const errorCodesData = transferCheckedErrorCodes.data.codes || [];
const eventsData = transferCheckedEvents.data.events || [];

export const transferCheckedFlow = {
  name: "Transfer Checked Flow",
  nodes: [
    {
      id: "transfer-checked-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "TransferChecked",
        description: "Transfers tokens from a source account to a destination account, enforcing the mint’s decimals.",
        code: transferCheckedCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
