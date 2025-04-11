import { mintToCheckedCode } from "./code/mintToCheckedCode";
import { mintToCheckedContext } from "./mintToCheckedContext";
import { mintToCheckedInput } from "./mintToCheckedInput";
import { mintToCheckedErrorCodes } from "./mintToCheckedErrorCodes";
import { mintToCheckedEvents } from "./mintToCheckedEvents";

const contextData = mintToCheckedContext.data.accounts || [];
const inputsData = mintToCheckedInput.data.fields || [];
const errorCodesData = mintToCheckedErrorCodes.data.codes || [];
const eventsData = mintToCheckedEvents.data.events || [];

export const mintToCheckedFlow = {
  name: "Mint To Checked Flow",
  nodes: [
    {
      id: "mint-to-checked-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "MintToChecked",
        description: "Mints a specified amount of tokens to an account, ensuring the provided decimals match the mint’s configuration.",
        code: mintToCheckedCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
