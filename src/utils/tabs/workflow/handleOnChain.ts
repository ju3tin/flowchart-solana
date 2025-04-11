import { validateDecimals } from "./dropUtils";

export function handleOnChainNodeOverrides(
  nodes: any[],
  walletPubkey?: string
) {
  return nodes.map(node => {
    // Clone the node to avoid mutating the original
    const updatedNode = { ...node };
    
    // Handle account nodes (SPL tokens, etc.)
    if (node.type === "accountNode" && node.data?.fields) {
      const updatedFields = node.data.fields.map((field: any) => {
        // 1) Mint Authority, Freeze Authority, or Payer
        if (
          field.label === "Mint Authority" ||
          field.label === "Freeze Authority" ||
          field.label === "Payer"
        ) {
          return {
            ...field,
            value: walletPubkey || "not set",
          };
        }
        
        // 2) Check decimals field, set default or clamp if invalid
        if (field.label === "Decimals") {
          const originalValue = (field.value ?? "").trim();
          if (!originalValue) {
            // If empty, pick your default
            return {
              ...field,
              value: "9", // or "6", "0", whichever you prefer
            };
          } else {
            // If user typed something, parse & clamp
            const validated = validateDecimals(originalValue, 9, 0, 9);
            return {
              ...field,
              value: validated.toString(),
            };
          }
        }

        // Otherwise return field as-is
        return field;
      });

      updatedNode.data = {
        ...updatedNode.data,
        fields: updatedFields,
      };
    }
    // Handle input nodes for on-chain operations
    else if (node.type === "inputNode" && node.data?.fields) {
      const updatedFields = node.data.fields.map((field: any) => {
        // Check decimals field, set default or clamp if invalid
        if (field.label === "Decimals") {
          const originalValue = (field.value ?? "").trim();
          if (!originalValue) {
            return {
              ...field,
              value: "9",
            };
          } else {
            const validated = validateDecimals(originalValue, 9, 0, 9);
            return {
              ...field,
              value: validated.toString(),
            };
          }
        }
        
        // Otherwise keep field as-is
        return field;
      });

      updatedNode.data = {
        ...updatedNode.data,
        fields: updatedFields,
      };
    }
    // Handle other on-chain specific node types here
    // else if (node.type === "candyMachineNode") { ... }

    return updatedNode;
  });
} 