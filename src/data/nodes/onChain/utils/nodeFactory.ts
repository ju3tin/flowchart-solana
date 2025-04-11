import { FlowNode } from "./flowInterfaces";

export function createFlowNode(
  overrides: Partial<FlowNode> & Pick<FlowNode, "type" | "id" | "data">
): FlowNode {
  const isInstruction = overrides.type === "instructionGroupNode";

  return {
    id: overrides.id,
    type: overrides.type,
    position: overrides.position ?? { x: 0, y: 0 },
    style: isInstruction 
      ? {
          width: 800,
          height: 600,
          backgroundColor: 'rgba(33, 39, 55, 0.1)',
          borderColor: 'rgba(42, 50, 74, 0.6)',
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: '8px',
          ...(overrides.style || {})
        } 
      : overrides.style,
    data: {
      ...overrides.data,
      isExpanded: overrides.data.isExpanded ?? isInstruction,
    }
  };
}
