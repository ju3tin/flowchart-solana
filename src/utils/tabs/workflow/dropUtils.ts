import { nanoid } from "nanoid";

export function duplicateFlowNodesAndEdges(
  draggedData: any,
  dropX: number,
  dropY: number
) {
  const nodeIdMap: Record<string, string> = {};
  draggedData.nodes.forEach((node: any) => {
    nodeIdMap[node.id] = `${node.type}-${nanoid(6)}`;
  });

  const newNodes = draggedData.nodes.map((node: any) => {
    const newNodeId = nodeIdMap[node.id];
    const newPosition = {
      x: node.position.x + dropX,
      y: node.position.y + dropY,
    };

    return {
      ...node,
      id: newNodeId,
      position: newPosition,
    };
  });

  const newEdges = (draggedData.edges || []).map((edge: any) => ({
    ...edge,
    id: `edge-${nanoid(6)}`,
    source: nodeIdMap[edge.source] || edge.source,
    target: nodeIdMap[edge.target] || edge.target,
  }));

  return { newNodes, newEdges, nodeIdMap };
}

export function validateDecimals(input: string, fallback = 9, min = 0, max = 9) {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return fallback;
  }
  return parsed;
} 