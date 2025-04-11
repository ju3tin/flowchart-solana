export function handleOffChainNodeOverrides(
  nodes: any[],
  walletPubkey?: string
) {
  return nodes.map(node => {
    const updatedNode = { ...node };
    
    if (node.type === "createNftNode" && node.data) {
      updatedNode.data = {
        ...updatedNode.data,
        walletPubkey: walletPubkey || null,
        metadata: updatedNode.data.metadata || {
          name: "My NFT",
          symbol: "NFT",
          description: "A description of my NFT",
          image: "",
          externalUrl: "",
          attributes: [],
        },
      };
    }
    
    else if (node.type === "metaplexNode" && node.data) {
      updatedNode.data = {
        ...updatedNode.data,
        walletPubkey: walletPubkey || null,
        config: updatedNode.data.config || {
          collectionName: "My Collection",
          collectionFamily: "",
          royaltyPercentage: 5,
          creatorAddress: walletPubkey || "",
        },
      };
    }
    
    else if (node.type === "uploadMetadataNode" && node.data) {
      updatedNode.data = {
        ...updatedNode.data,
        walletPubkey: walletPubkey || null,
      };
    }    
    return updatedNode;
  });
} 