export const createNftAccountsUtils = `
// File: src/utils/metadataUploaderUtils.ts

import { WalletContextState } from "@solana/wallet-adapter-react";
import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import BigNumber from "bignumber.js";

// Extract network name from endpoint URL for debugging
function getNetworkFromEndpoint(endpoint: string): string {
  if (endpoint.includes('devnet')) return 'devnet';
  if (endpoint.includes('mainnet')) return 'mainnet-beta';
  if (endpoint.includes('testnet')) return 'testnet';
  return 'unknown';
}

/**
 * Connect to Irys Bundler, returning an uploader we can use to upload
 * files and metadata, **funded by** the user's connected Solana wallet.
 */
async function getIrysUploader(wallet: WalletContextState) {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Solana wallet is not connected.");
  }
  
  try {
    // Verify wallet connection & RPC before proceeding
    // Accessing connection if available in wallet
    let connectionValidated = false;
    
    // FORCE DEVNET: Create an explicit devnet connection instead of relying on wallet connection
    const devnetEndpoint = clusterApiUrl(WalletAdapterNetwork.Devnet);
    console.log(\`Explicitly connecting to Solana \${WalletAdapterNetwork.Devnet} at \${devnetEndpoint}\`);
    
    // Create a new connection to devnet with finalized commitment
    const devnetConnection = new Connection(devnetEndpoint, "finalized");
    console.log("Using 'finalized' commitment level for Solana transactions");
    
    try {
      // Test the connection by getting a recent blockhash
      const { blockhash } = await devnetConnection.getLatestBlockhash();
      console.log(\`Devnet connection verified with blockhash: \${blockhash.substring(0, 10)}...\`);
      connectionValidated = true;
    } catch (rpcError) {
      console.error("Devnet connection test failed:", rpcError);
      throw new Error(\`Solana devnet RPC error: \${rpcError instanceof Error ? rpcError.message : String(rpcError)}. Please try:
1. Make sure your wallet is connected to devnet
2. Check if your RPC endpoint is correctly configured and has appropriate permissions\`);
    }

    if (!connectionValidated) {
      console.warn("Connection could not be validated before Irys upload. This might cause 403 errors.");
    }

    // This passes the user's wallet from @solana/wallet-adapter-react
    // but FORCES the use of devnet connection
    console.log("Connecting to Irys with wallet:", wallet.publicKey.toString());
    
    try {
      // CRITICAL: We need to explicitly tell Irys to use devnet by calling .devnet()
      // AND we must provide a devnet RPC URL with .withRpc()
      const devnetRpcUrl = devnetEndpoint; // Use the same RPC endpoint we're already using
      console.log("Using RPC URL for Irys devnet:", devnetRpcUrl);
      
      const irysUploader = await WebUploader(WebSolana)
        .withProvider(wallet)
        .withRpc(devnetRpcUrl) // This is required for devnet connections
        .devnet(); // This is critical to avoid connecting to mainnet-beta
      
      console.log("Irys Uploader connected using devnet. Address:", irysUploader.address);
      
      // Test the connection by getting the loaded balance
      try {
        const balanceAtomic = await irysUploader.getLoadedBalance();
        console.log("Irys bundler balance verified:", irysUploader.utils.fromAtomic(balanceAtomic));
      } catch (balanceError) {
        console.warn("Could not verify Irys bundler balance, but continuing:", balanceError);
      }
      
      return irysUploader;
    } catch (irysError) {
      console.error("Error connecting to Irys bundler:", irysError);
      throw irysError;
    }
  } catch (error) {
    console.error("Error initializing Irys uploader:", error);
    if (String(error).includes("403") || String(error).includes("blockhash")) {
      throw new Error(\`Failed to get recent blockhash: Your Solana RPC endpoint returned a 403 Forbidden error.
This happens when there's a network mismatch. For devnet specifically:
1. Make sure your wallet is connected to devnet
2. IMPORTANT: The Irys SDK defaults to mainnet-beta! We've updated the code to use .devnet() 
   to explicitly tell Irys to use devnet connections
3. Check for domain/origin restrictions on your RPC provider\`);
    }
    throw new Error(\`Failed to connect to Irys bundler: \${error instanceof Error ? error.message : String(error)}\`);
  }
}

/**
 * Uploads a file to Irys (auto-funding if needed).
 * @param irysUploader The object returned from getIrysUploader()
 * @param file The File to upload
 * @returns Gateway URL, e.g. "https://gateway.irys.xyz/<ID>"
 */
export async function uploadFileToIrys(irysUploader: any, file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  try {
    // 1) Cost to upload
    const costAtomic = await irysUploader.getPrice(file.size);
    console.log(\`Cost to upload \${file.name}: \${irysUploader.utils.fromAtomic(costAtomic)}\`);

    // 2) Check bundler balance
    const balanceAtomic = await irysUploader.getLoadedBalance();
    console.log(\`Current bundler balance: \${irysUploader.utils.fromAtomic(balanceAtomic)} \${irysUploader.token}\`);
    
    // 3) AUTOMATICALLY fund if balance is insufficient
    if (balanceAtomic.lt(costAtomic)) {
      // Need more SOL - calculate the funding amount (plus a small buffer)
      const difference = costAtomic.minus(balanceAtomic);
      // Add a 10% buffer to ensure we have enough for any fees or fluctuations
      const fundingAmount = difference.multipliedBy(1.1); 
      
      console.log(\`Automatically funding bundler with: \${irysUploader.utils.fromAtomic(fundingAmount)} \${irysUploader.token}\`);
      console.log(\`This funding will cover the cost of: \${irysUploader.utils.fromAtomic(costAtomic)} \${irysUploader.token}\`);
      
      try {
        // Attempt to fund the bundler
        await irysUploader.fund(fundingAmount);
        console.log(\`Funding complete - new balance: \${irysUploader.utils.fromAtomic(await irysUploader.getLoadedBalance())} \${irysUploader.token}\`);
      } catch (fundError) {
        console.error(\`Error funding bundler: \${fundError}\`);
        throw new Error(\`Failed to fund bundler: \${fundError instanceof Error ? fundError.message : String(fundError)}. Make sure your wallet has enough SOL.\`);
      }
    } else {
      console.log(\`Bundler balance is sufficient for this upload. No funding needed.\`);
    }

    // 4) Upload file
    const tags = [
      { name: "Content-Type", value: file.type || "application/octet-stream" },
      { name: "App-Name", value: "Irys WebUpload Demo" },
    ];
    const receipt = await irysUploader.uploadFile(file, { tags });
    console.log(\`File uploaded. Receipt: \${receipt}\`);

    // Typical gateway URL: "https://gateway.irys.xyz/<id>"
    return \`https://gateway.irys.xyz/\${receipt.id}\`;
  } catch (error) {
    console.error(\`Error uploading file to Irys: \${error}\`);
    if (String(error).includes("403") || String(error).includes("blockhash")) {
      throw new Error(\`Failed to get recent blockhash: Your Solana RPC endpoint returned a 403 Forbidden error.
This happens when there's a network mismatch. For devnet specifically:
1. Make sure your wallet is connected to devnet
2. IMPORTANT: The Irys SDK defaults to mainnet-beta! We've updated the code to use .devnet() 
   to explicitly tell Irys to use devnet connections
3. Check for domain/origin restrictions on your RPC provider\`);
    } else if (String(error).includes("Not enough balance") || String(error).includes("402")) {
      throw new Error(\`Failed to fund the bundler: Not enough SOL in your wallet. 
Please make sure your wallet has enough SOL to cover the upload cost.
Consider using a faucet to get more devnet SOL: https://solfaucet.com/\`);
    }
    throw new Error(
      \`Failed to upload file: \${error instanceof Error ? error.message : String(error)}\`
    );
  }
}

/**
 * Uploads metadata referencing the file URI you just uploaded.
 * Returns the gateway URL for the metadata JSON.
 */
export async function uploadMetadataToIrys(
  irysUploader: any,
  name: string,
  description: string,
  fileUri: string
): Promise<string> {
  if (!fileUri) throw new Error("File URI not provided");
  if (!name || !description) throw new Error("Please provide name & description");

  try {
    // Example NFT metadata structure
    const metadata = {
      name,
      description,
      image: fileUri,
      attributes: [{ trait_type: "Created With", value: "Irys WebUpload" }],
    };
    const metadataString = JSON.stringify(metadata);
    const metadataBuffer = new TextEncoder().encode(metadataString);

    // 1) Check cost
    const costAtomic = await irysUploader.getPrice(metadataBuffer.length);
    console.log(\`Cost to upload metadata: \${irysUploader.utils.fromAtomic(costAtomic)} \${irysUploader.token}\`);

    // 2) Check bundler balance
    const balanceAtomic = await irysUploader.getLoadedBalance();
    console.log(\`Current bundler balance: \${irysUploader.utils.fromAtomic(balanceAtomic)} \${irysUploader.token}\`);
    
    // 3) AUTOMATICALLY fund if balance is insufficient
    if (balanceAtomic.lt(costAtomic)) {
      // Need more SOL - calculate the funding amount (plus a small buffer)
      const difference = costAtomic.minus(balanceAtomic);
      // Add a 10% buffer to ensure we have enough for any fees or fluctuations
      const fundingAmount = difference.multipliedBy(1.1);
      
      console.log(\`Automatically funding bundler with: \${irysUploader.utils.fromAtomic(fundingAmount)} \${irysUploader.token}\`);
      console.log(\`This funding will cover the cost of: \${irysUploader.utils.fromAtomic(costAtomic)} \${irysUploader.token}\`);
      
      try {
        // Attempt to fund the bundler
        await irysUploader.fund(fundingAmount);
        console.log(\`Funding complete - new balance: \${irysUploader.utils.fromAtomic(await irysUploader.getLoadedBalance())} \${irysUploader.token}\`);
      } catch (fundError) {
        console.error(\`Error funding bundler: \${fundError}\`);
        throw new Error(\`Failed to fund bundler: \${fundError instanceof Error ? fundError.message : String(fundError)}. Make sure your wallet has enough SOL.\`);
      }
    } else {
      console.log(\`Bundler balance is sufficient for this upload. No funding needed.\`);
    }

    // 4) Upload metadata
    const tags = [
      { name: "Content-Type", value: "application/json" },
      { name: "App-Name", value: "Irys WebUpload Demo" },
    ];
    const receipt = await irysUploader.upload(metadataString, { tags });
    console.log(\`Metadata uploaded. Receipt: \${receipt}\`);

    return \`https://gateway.irys.xyz/\${receipt.id}\`;
  } catch (error) {
    console.error(\`Error uploading metadata: \${error}\`);
    if (String(error).includes("403") || String(error).includes("blockhash")) {
      throw new Error(\`Failed to get recent blockhash: Your Solana RPC endpoint returned a 403 Forbidden error.
This happens when there's a network mismatch. For devnet specifically:
1. Make sure your wallet is connected to devnet
2. IMPORTANT: The Irys SDK defaults to mainnet-beta! We've updated the code to use .devnet() 
   to explicitly tell Irys to use devnet connections
3. Check for domain/origin restrictions on your RPC provider\`);
    } else if (String(error).includes("Not enough balance") || String(error).includes("402")) {
      throw new Error(\`Failed to fund the bundler: Not enough SOL in your wallet. 
Please make sure your wallet has enough SOL to cover the upload cost.
Consider using a faucet to get more devnet SOL: https://solfaucet.com/\`);
    }
    throw new Error(
      \`Failed to upload metadata: \${error instanceof Error ? error.message : String(error)}\`
    );
  }
}

/**
 * High-level convenience function:
 * 1) Build the Irys uploader from the user's wallet
 * 2) Upload the file to Irys
 * 3) Upload metadata referencing that file
 * Returns final "metadataUrl".
 */
export async function uploadNftWithIrysPipeline(
  wallet: WalletContextState,
  file: File,
  name: string,
  description: string
): Promise<string> {
  if (!wallet?.connected) {
    throw new Error("No Solana wallet is connected");
  }

  // 1) Build the IrysUploader
  const irysUploader = await getIrysUploader(wallet);

  // 2) Upload the file (this auto-funds if needed)
  const fileUri = await uploadFileToIrys(irysUploader, file);
  console.log(\`Uploaded file at: \${fileUri}\`);

  // 3) Upload metadata referencing that file
  const metadataUri = await uploadMetadataToIrys(irysUploader, name, description, fileUri);
  console.log("NFT metadata is at:", metadataUri);

  return metadataUri;
};
`