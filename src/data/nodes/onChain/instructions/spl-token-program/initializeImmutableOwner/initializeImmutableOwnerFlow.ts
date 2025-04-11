import { initializeImmutableOwnerCode } from "./code/initializeImmutableOwnerCode";
import { initializeImmutableOwnerContext } from "./initializeImmutableOwnerContext";
import { initializeImmutableOwnerInput } from "./initializeImmutableOwnerInput";
import { initializeImmutableOwnerErrorCodes } from "./initializeImmutableOwnerErrorCodes";
import { initializeImmutableOwnerEvents } from "./initializeImmutableOwnerEvents";

const contextData = initializeImmutableOwnerContext.data.accounts || [];
const inputsData = initializeImmutableOwnerInput.data.fields || [];
const errorCodesData = initializeImmutableOwnerErrorCodes.data.codes || [];
const eventsData = initializeImmutableOwnerEvents.data.events || [];

export const initializeImmutableOwnerFlow = {
  name: "Initialize Immutable Owner Flow",
  nodes: [
    {
      id: "initialize-immutable-owner-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Immutable Owner",
        description: "Marks the owner of a token account as immutable, preventing future changes.",
        code: initializeImmutableOwnerCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
