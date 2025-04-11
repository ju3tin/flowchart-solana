import { metadataUploaderComponent } from '../code/components/metadata-uploader-tsx';
import { metadataUploaderCss } from '../code/styles/metadata-uploader-css';
import { metadataUploaderUtils } from '../code/utils/metadata-uploader-utils';
import { createNftAccountsUtils } from '../code/utils/create-nft-accounts-utils';

// Registry for NFT Minter application nodes
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
        path: "app/src/styles/MetadataUploader.css",
        content: metadataUploaderCss
      }
    ],
    utils: [
      {
        path: "app/src/utils/metadataUploaderUtils.ts",
        content: metadataUploaderUtils
      }
    ],
    dependencies: {
      "@solana/wallet-adapter-react": "^0.15.35",
      "@irys/web-upload": "^0.0.15",
      "@irys/web-upload-solana": "^0.1.8",
      "@solana/web3.js": "^1.87.6",
      "@solana/wallet-adapter-base": "^0.9.23",
      "bignumber.js": "^9.0.1"
    }
  },
  createNftNode: {
    components: [],
    styles: [],
    utils: [
      {
        path: "app/src/utils/createNftAccountsUtils.ts",
        content: createNftAccountsUtils
      },
    ],
    dependencies: {
      "@solana/wallet-adapter-react": "^0.15.35",
      "@solana/web3.js": "^1.87.6",
      "@solana/spl-token": "^0.4.13",
      "@metaplex-foundation/umi-bundle-defaults": "^1.1.1",
      "@metaplex-foundation/umi-signer-wallet-adapters": "^1.1.1",
      "@metaplex-foundation/umi": "^1.1.1",
      "@metaplex-foundation/mpl-token-metadata": "^3.4.0",
      "@metaplex-foundation/umi-web3js-adapters": "^1.1.1"
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