import { toaster } from "../../../../components/ui/toaster";
import { placeholder } from "./apps/code/nft/metadataUploaderUtils";

export const uploadOffChainNodeData = {
  type: "uploadMetadataNode",
  data: {
    label: "Upload NFT Metadata",
    functionName: "metadataUploaderUtils",
    parameters: [
      { 
        label: "Name",
        description: "Name of the NFT or asset" 
      },
      { 
        label: "Description",
        description: "A description of the NFT or asset"
      },
      { 
        label: "Image File Path",
        description: "Path or URL to the image file to upload" 
      },
    ],
    
    // Define output fields
    outputFields: {
      metadataUrl: {
        label: "IPFS Metadata URL",
        type: "string"
      }
    },
    
    // Attach the run function
    runFunction: placeholder,
  },
  position: { x: 0, y: 0 },
};