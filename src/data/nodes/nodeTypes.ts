import { InstructionGroupNode } from "@/components/main/nodes/onChain/instruction/InstructionNode";
import { InputNode } from "@/components/main/nodes/onChain/inputs/inputNode";
import { OutputNode } from "@/components/main/nodes/onChain/outputs/outPutNode";
import { AccountNode } from "@/components/main/nodes/onChain/accounts/AccountNode";
import { ContextNode } from "@/components/main/nodes/onChain/context/ContextNode";
import { ErrorCodesNode } from "@/components/main/nodes/onChain/errorCodes/errorCodesNode";
import { EventsNode } from "@/components/main/nodes/onChain/events/EventsNode";
import { OffChainFunctionNode } from "@/components/main/nodes/offChain/OffChainFunctionNode";

export const workflowNodeTypes = {
    inputNode: InputNode,
    instructionGroupNode: InstructionGroupNode,
    accountNode: AccountNode,
    outputNode: OutputNode,
    contextNode: ContextNode,
    errorCodesNode: ErrorCodesNode,
    eventsNode: EventsNode,

    uploadMetadataNode: OffChainFunctionNode,
    createNftNode: OffChainFunctionNode,
    mintNftNode: OffChainFunctionNode,
};
