import { syncNativeCode } from "./code/syncNativeCode";
import { syncNativeContext } from "./syncNativeContext";
import { syncNativeInput } from "./syncNativeInput";
import { syncNativeErrorCodes } from "./syncNativeErrorCodes";
import { syncNativeEvents } from "./syncNativeEvents";

const contextData = syncNativeContext.data.accounts || [];
const inputsData = syncNativeInput.data.fields || [];
const errorCodesData = syncNativeErrorCodes.data.codes || [];
const eventsData = syncNativeEvents.data.events || [];

export const syncNativeFlow = {
  name: "Sync Native Flow",
  nodes: [
    {
      id: "sync-native-instruction",
      type: "instructionGroupNode",
      position: { x: 0, y: 0 },
      data: {
        label: "SyncNative",
        description: "Syncs a wrapped native SOL account's SPL balance with its underlying lamports.",
        code: syncNativeCode,
        accounts: contextData,
        parameters: inputsData,
        errorCodes: errorCodesData,
        events: eventsData,
      },
    },
  ],
  edges: [],
};
