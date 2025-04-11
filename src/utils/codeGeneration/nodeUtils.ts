import { ProjectContextType } from '@/context/project/ProjectContextTypes';

const onChainNodeTypes = ["accountNode", "inputNode", "instructionGroupNode", "instructionNode"];

export function hasOnChainNodes(projectContext: ProjectContextType): boolean {
  if (!projectContext.details?.projectState?.nodes) return false;
  
  const allNodes = projectContext.details.projectState.nodes;
  console.log('allNodes', allNodes);

  allNodes.forEach((node, index) => {
    console.log(`Node ${index}:`, node.type, onChainNodeTypes.includes(node.type));
  });
  
  return allNodes.some((node) => {
    return onChainNodeTypes.includes(node.type);
  });
} 