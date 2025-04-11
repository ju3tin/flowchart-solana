import { CodeFile, DependencyMap } from './offChain/nftMetaplex/apps/code-interfaces';
import { registry as nftMinterRegistry } from './offChain/nftMetaplex/apps/registries/nftMinterRegistry';

export type NodeType = 'uploadMetadataNode' | 'createNftNode' | 'mintNftNode';

export interface NodeConfig {
  components?: CodeFile[];
  styles?: CodeFile[];
  utils?: CodeFile[];
  dependencies?: DependencyMap;
}

export type Registry = Record<NodeType, NodeConfig>;

const registryMap: Record<NodeType, Registry> = {
  'uploadMetadataNode': nftMinterRegistry,
  'createNftNode': nftMinterRegistry,
  'mintNftNode': nftMinterRegistry,
};

export const getRegistryForNodeType = async (nodeType: NodeType): Promise<Registry | null> => {
  const registry = registryMap[nodeType];
  
  if (!registry) {
    console.log(`No registry mapping found for node type: ${nodeType}`);
    return null;
  }
  return registry;
};

export const getFilesForNodeType = async (nodeType: NodeType): Promise<CodeFile[]> => {
  console.log(`Fetching files for node type: ${nodeType}`);
  
  const registry = await getRegistryForNodeType(nodeType);
  
  if (!registry) {
    console.error(`No registry found for node type: ${nodeType}`);
    return [];
  }
  
  console.log(`Registry for ${nodeType}:`, Object.keys(registry));
  
  const nodeConfig = registry[nodeType as keyof typeof registry];
  
  if (!nodeConfig) {
    console.error(`No configuration found for node type: ${nodeType} in its registry`);
    console.error(`Available configurations:`, Object.keys(registry));
    return [];
  }
  
  console.log(`Node config for ${nodeType}:`, nodeConfig);
  
  const allFiles = [
    ...(nodeConfig.components || []),
    ...(nodeConfig.styles || []),
    ...(nodeConfig.utils || [])
  ];
  
  console.log(`Found ${allFiles.length} files for ${nodeType}:`);
  console.log(`- Components: ${nodeConfig.components?.length || 0}`);
  console.log(`- Styles: ${nodeConfig.styles?.length || 0}`);
  console.log(`- Utils: ${nodeConfig.utils?.length || 0}`);
  
  return allFiles;
};

export const getDependenciesForNodeType = async (nodeType: NodeType): Promise<DependencyMap> => {
  console.log(`Fetching dependencies for node type: ${nodeType}`);
  
  const registry = await getRegistryForNodeType(nodeType);
  
  if (!registry) {
    console.error(`No registry found for node type: ${nodeType}`);
    return {};
  }
  
  const nodeConfig = registry[nodeType as keyof typeof registry];
  
  if (!nodeConfig) {
    console.error(`No configuration found for node type: ${nodeType} in its registry`);
    return {};
  }
  
  console.log(`Found ${Object.keys(nodeConfig.dependencies || {}).length} dependencies for ${nodeType}`);
  return nodeConfig.dependencies || {};
}; 