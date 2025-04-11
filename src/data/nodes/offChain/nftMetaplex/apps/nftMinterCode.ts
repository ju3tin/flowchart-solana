import { CodeFile, DependencyMap } from './code-interfaces';
import { metadataUploaderComponent } from './code/components/metadata-uploader-tsx';
import { metadataUploaderCss } from './code/styles/metadata-uploader-css';
import { metadataUploaderUtils } from './code/utils/metadata-uploader-utils';

// Define the NodeType type directly in this file to match the registry keys
type NodeType = 'uploadMetadataNode' | 'createNftNode' | 'mintNftNode';

export const registry = {
  uploadMetadataNode: {
    components: [
      {
        path: "app/src/components/MetadataUploader.tsx",
        content: metadataUploaderComponent
      }
    ],
    styles: [
      {
        path: "app/src/components/MetadataUploader.css",
        content: metadataUploaderCss
      }
    ],
    utils: [
      {
        path: "app/src/utils/metadata-uploader.ts",
        content: metadataUploaderUtils
      }
    ],
    dependencies: {
      "@irys/sdk": "latest",
      "@solana/wallet-adapter-react": "latest"
    }
  },
  createNftNode: {
    components: [],
    styles: [],
    utils: [
      {
        path: "app/src/utils/nft/nftAccounts.ts",
        content: `// NFT account creation utilities`
      },
      {
        path: "app/src/utils/nft/nftMint.ts",
        content: `// NFT minting utilities`
      }
    ],
    dependencies: {
      "@solana/web3.js": "^1.87.6",
      "@solana/spl-token": "^0.3.8"
    }
  },
  mintNftNode: {
    components: [
      {
        path: "app/src/components/NftMinter.tsx",
        content: `// Your NFT minter component code`
      }
    ],
    styles: [
      {
        path: "app/src/components/NftMinter.css",
        content: `// Your NFT minter component CSS`
      }
    ],
    utils: [
      {
        path: "app/src/utils/nft/nftAccounts.ts",
        content: `// NFT account creation utilities`
      },
      {
        path: "app/src/utils/nft/nftMint.ts",
        content: `// NFT minting utilities`
      }
    ],
    dependencies: {
      "@solana/web3.js": "^1.87.6",
      "@solana/spl-token": "^0.3.8"
    }
  }
};

export function getFilesForNodeType(nodeType: NodeType): CodeFile[] {
  console.log(`Fetching files for node type: ${nodeType}`);
  
  const nodeConfig = registry[nodeType];
  
  if (!nodeConfig) {
    console.error(`No configuration found for node type: ${nodeType}. Available node types:`, Object.keys(registry));
    return [];
  }
  
  const allFiles = [
    ...nodeConfig.components,
    ...nodeConfig.styles,
    ...nodeConfig.utils
  ];
  
  console.log(`Found ${allFiles.length} files for ${nodeType}:`);
  console.log(`- Components: ${nodeConfig.components.length}`);
  console.log(`- Styles: ${nodeConfig.styles.length}`);
  console.log(`- Utils: ${nodeConfig.utils.length}`);
  
  return allFiles;
}

export function getDependenciesForNodeType(nodeType: NodeType): DependencyMap {
  console.log(`Fetching dependencies for node type: ${nodeType}`);
  
  const nodeConfig = registry[nodeType];
  
  if (!nodeConfig) {
    console.error(`No configuration found for node type: ${nodeType}. Available node types:`, Object.keys(registry));
    return {};
  }
  
  console.log(`Found ${Object.keys(nodeConfig.dependencies).length} dependencies for ${nodeType}`);
  return nodeConfig.dependencies;
}