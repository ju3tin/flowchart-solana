import { setAuthorityCode } from "./code/setAuthorityCode";
import { setAuthorityContext } from "./setAuthorityContext";
import { setAuthorityInput } from "./setAuthorityInput";
import { setAuthorityErrorCodes } from "./setAuthorityErrorCodes";
import { setAuthorityEvents } from "./setAuthorityEvents";

const contextData = setAuthorityContext.data.accounts || [];
const inputsData = setAuthorityInput.data.fields || [];
const errorCodesData = setAuthorityErrorCodes.data.codes || [];
const eventsData = setAuthorityEvents.data.events || [];

export const setAuthorityFlow = {
  name: "Set Authority Flow",
  nodes: [
    {
      id: "set-authority-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Set Authority",
        description: "Changes or removes an SPL Token mint/account authority, such as MintTokens, FreezeAccount, AccountOwner, or CloseAccount.",
        code: setAuthorityCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
