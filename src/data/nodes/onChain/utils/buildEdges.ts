export function buildContextEdges(instructionNode: any) {
    const edges: any[] = [];
  
    if (instructionNode?.data?.context) {
      instructionNode.data.context.forEach((ctxItem: any, index: number) => {
        const sourceNodeId = ctxItem.nodeId; 
        if (sourceNodeId) {
          edges.push({
            id: `edge-${sourceNodeId}-to-${instructionNode.id}-${index}`,
            source: sourceNodeId,
            target: instructionNode.id,
            sourceHandle: "b-acc",
            targetHandle: `context-handle-${index}`, 
            type: "default",
            animated: true,
            style: { stroke: '#1e2339', strokeWidth: 3 },
          });
        }
      });
    }
  
    return edges;
  }

  export function buildInputEdges(instructionNode: any) {
    const edges: any[] = [];
  
    if (instructionNode?.data?.inputs) {
      instructionNode.data.inputs.forEach((inputItem: any, index: number) => {
        const sourceNodeId = inputItem.nodeId;
        if (sourceNodeId) {
          edges.push({
            id: `edge-${sourceNodeId}-to-${instructionNode.id}-input-${index}`,
            source: sourceNodeId,
            target: instructionNode.id,
            sourceHandle: "d-inp",
            targetHandle: `input-handle-${index}`,
            type: "default",
            animated: true,
            style: { stroke: "#a8b5e6", strokeWidth: 3 },
          });
        }
      });
    }
  
    return edges;
  }

export function buildEdges(instructionNode: any) {
    const contextEdges = buildContextEdges(instructionNode);
    const inputEdges = buildInputEdges(instructionNode);
    return [...contextEdges, ...inputEdges];
  }