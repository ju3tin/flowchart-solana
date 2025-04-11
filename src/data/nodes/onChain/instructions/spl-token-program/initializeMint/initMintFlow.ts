import { initMintCode } from "./code/initMintCode";
import { initMintContextNode } from "./initMintContext";
import { initMintInputNode } from "./initMintInputNode";
import { initMintErrorCodesNode } from "./initMintErrorCodes";
import { initMintEventsNode } from "./initMintEvents";

const contextData = initMintContextNode.data.accounts || [];
const inputsData = initMintInputNode.data.fields || [];
const errorCodesData = initMintErrorCodesNode.data.codes || [];
const eventsData = initMintEventsNode.data.events || [];

export const initMintFlow = {
  name: "Initialize Mint Flow",
  nodes: [
    {
      id: "init-mint-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Initialize Mint",
        description: "Creates and initializes a new token mint account with the given decimals and authorities.",
        code: initMintCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
