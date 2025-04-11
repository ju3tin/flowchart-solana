import { containerFileApi } from "@/api/containerFileApi";
import { pollTaskStatus3 as pollTaskStatus } from "@/utils/task/taskUtils";
import { 
  MINT_FORM_TSX, 
  THEME_TOGGLE_TSX, 
  TOKEN_CREATED_SUCCESS_TSX, 
  WALLET_TSX, 
  HOME_PAGE_TSX, 
  GLOBALS_CSS, 
  TAILWIND_CONFIG,
  POSTCSS_CONFIG,
  BUTTON_TSX,
  INPUT_TSX,
  LABEL_TSX,
  UTILS_TS
} from "./frontendUITemplates";

export const createOrUpdateFile = async (
  projectId: string,
  path: string,
  content: string
): Promise<{ success: boolean, taskId?: string }> => {
  try {
    let response;
    
    try {
      const checkResponse = await containerFileApi.getFileContent(projectId, path);
      const updateResponse = await containerFileApi.updateFile(projectId, path, content);
      response = updateResponse;
      console.log(`File ${path} exists, updating it...`);
    } catch (error) {
      console.log(`File ${path} does not exist, creating it...`);
      const createResponse = await containerFileApi.createFile(projectId, path, content);
      response = createResponse;
    }
    
    const result = await pollTaskStatus(response.taskId);
    
    const success = result.task.status === "succeed" || result.task.status === "finished" || result.task.status === "warning";
    if (success) {
      console.log(`Successfully ${response.message || "processed"} file: ${path}`);
    } else {
      console.error(`Failed to process file ${path}. Status: ${result.task.status}`);
    }
    
    return { success, taskId: response.taskId };
  } catch (error) {
    console.error(`Error handling file ${path}:`, error);
    return { success: false };
  }
};

export const updateAppFile = async (
  projectId: string
): Promise<{ success: boolean, taskId?: string }> => {
  const appFilePath = "src/App.tsx";
  
  try {
    const newAppContent = `import React, { useState } from 'react';
import './globals.css';
import { MintForm } from './components/mint-form';
import { ThemeToggle } from './components/theme-toggle';
import { TokenCreatedSuccess } from './components/token-created-success';
import { Wallet } from './components/wallet';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';

function App() {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  // Set up wallet connection
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  const handleSuccess = (signature: string) => {
    setTxSignature(signature);
  };

  const handleReset = () => {
    setTxSignature(null);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                SolMint
              </h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Wallet />
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                  Launch your SPL token on Solana
                </h2>
                
                {txSignature ? (
                  <TokenCreatedSuccess 
                    txSignature={txSignature} 
                    onReset={handleReset} 
                  />
                ) : (
                  <MintForm onSuccess={handleSuccess} />
                )}
              </div>
              
              <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Launch your own SPL token on Solana with just a few clicks.</p>
                <p className="mt-1">Fast, secure, and decentralized.</p>
              </footer>
            </div>
          </div>
        </main>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;`;

    console.log(`Updating App.tsx with SPL token UI...`);
    
    // Create or update the App.tsx file with proper error handling
    const result = await createOrUpdateFile(projectId, appFilePath, newAppContent);
    
    if (result.success) {
      console.log(`Successfully updated ${appFilePath} with SPL token UI`);
    } else {
      console.error(`Failed to update ${appFilePath}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error updating App.tsx:`, error);
    return { success: false };
  }
};

export const updateIndexFiles = async (
  projectId: string
): Promise<{ success: boolean, taskId?: string }> => {
  try {
    const indexTsxPath = "src/index.tsx";
    const indexJsPath = "src/index.js";
    
    const indexTsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './globals.css';

// Mount the React application to the root element
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    const indexJsContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './globals.css';

// Mount the React application to the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    console.log(`Updating index files to render SPL token UI...`);
    
    let tsxResult: { success: boolean, taskId?: string } = { success: false };
    try {
      console.log(`Attempting to update ${indexTsxPath}...`);
      tsxResult = await createOrUpdateFile(projectId, indexTsxPath, indexTsxContent);
      
      if (tsxResult.success) {
        console.log(`Successfully updated ${indexTsxPath}`);
        return tsxResult;
      } else {
        console.log(`Failed to update ${indexTsxPath}, will try ${indexJsPath}`);
      }
    } catch (error) {
      console.error(`Error updating ${indexTsxPath}:`, error);
    }
    
    if (!tsxResult.success) {
      try {
        console.log(`Attempting to update ${indexJsPath}...`);
        const jsResult = await createOrUpdateFile(projectId, indexJsPath, indexJsContent);
        
        if (jsResult.success) {
          console.log(`Successfully updated ${indexJsPath}`);
          return jsResult;
        } else {
          console.error(`Failed to update ${indexJsPath}`);
          return { success: false };
        }
      } catch (error) {
        console.error(`Error updating ${indexJsPath}:`, error);
        return { success: false };
      }
    }
    
    return tsxResult;
  } catch (error) {
    console.error("Error updating index files:", error);
    return { success: false };
  }
};

export const installUIDependencies = async (
  projectId: string
): Promise<{ success: boolean, taskId?: string }> => {
  try {
    const dependencies = [
      "tailwindcss",
      "postcss",
      "autoprefixer",
      "tailwindcss-animate",
      
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      
      "@solana/wallet-adapter-base",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-react-ui",
      "@solana/wallet-adapter-phantom",
      "@solana/web3.js"
    ];
    
    console.log("Installing UI dependencies:", dependencies);
    
    const response = await containerFileApi.installDependencies(projectId, dependencies, 'app');
    
    const result = await pollTaskStatus(response.taskId);
    
    const success = result.task.status === "succeed" || result.task.status === "finished" || result.task.status === "warning";
    if (success) {
      console.log("Dependencies installed successfully");
    } else {
      console.error(`Failed to install dependencies. Status: ${result.task.status}`);
    }
    
    return { success, taskId: response.taskId };
  } catch (error) {
    console.error("Error installing UI dependencies:", error);
    return { success: false };
  }
};

export const insertFrontendUIFiles = async (
  projectId: string
): Promise<string | undefined> => {
  console.log('[DEBUG_FRONTEND_UI] Starting insertFrontendUIFiles for project:', projectId);
  try {
    console.log('[DEBUG_FRONTEND_UI] Creating components directory structure...');
    let lastTaskId: string | undefined;
    try {
      const dirResponse = await containerFileApi.createFile(projectId, 'src/components', '');
      lastTaskId = dirResponse.taskId;
      await containerFileApi.createFile(projectId, 'src/components/ui', '');
      await containerFileApi.createFile(projectId, 'src/pages', '');
      const libResponse = await containerFileApi.createFile(projectId, 'src/lib', '');
      lastTaskId = libResponse.taskId;
    } catch (error) {
      console.log('[DEBUG_FRONTEND_UI] Directory structure might already exist:', error);
    }
    
    console.log('[DEBUG_FRONTEND_UI] Creating UI component files...');
    const mintFormResponse = await createOrUpdateFile(projectId, 'src/components/mint-form.tsx', MINT_FORM_TSX);
    if (mintFormResponse.taskId) lastTaskId = mintFormResponse.taskId;
    
    const themeToggleResponse = await createOrUpdateFile(projectId, 'src/components/theme-toggle.tsx', THEME_TOGGLE_TSX);
    if (themeToggleResponse.taskId) lastTaskId = themeToggleResponse.taskId;
    
    const tokenSuccessResponse = await createOrUpdateFile(projectId, 'src/components/token-created-success.tsx', TOKEN_CREATED_SUCCESS_TSX);
    if (tokenSuccessResponse.taskId) lastTaskId = tokenSuccessResponse.taskId;
    
    const walletResponse = await createOrUpdateFile(projectId, 'src/components/wallet.tsx', WALLET_TSX);
    if (walletResponse.taskId) lastTaskId = walletResponse.taskId;
    
    const homePageResponse = await createOrUpdateFile(projectId, 'src/pages/index.tsx', HOME_PAGE_TSX);
    if (homePageResponse.taskId) lastTaskId = homePageResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Creating UI library components...');
    const buttonResponse = await createOrUpdateFile(projectId, 'src/components/ui/button.tsx', BUTTON_TSX);
    if (buttonResponse.taskId) lastTaskId = buttonResponse.taskId;
    
    const inputResponse = await createOrUpdateFile(projectId, 'src/components/ui/input.tsx', INPUT_TSX);
    if (inputResponse.taskId) lastTaskId = inputResponse.taskId;
    
    const labelResponse = await createOrUpdateFile(projectId, 'src/components/ui/label.tsx', LABEL_TSX);
    if (labelResponse.taskId) lastTaskId = labelResponse.taskId;
    
    const utilsResponse = await createOrUpdateFile(projectId, 'src/lib/utils.ts', UTILS_TS);
    if (utilsResponse.taskId) lastTaskId = utilsResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Creating global CSS files...');
    const cssResponse = await createOrUpdateFile(projectId, 'src/globals.css', GLOBALS_CSS);
    if (cssResponse.taskId) lastTaskId = cssResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Creating build configuration files...');
    const tailwindResponse = await createOrUpdateFile(projectId, 'tailwind.config.js', TAILWIND_CONFIG);
    if (tailwindResponse.taskId) lastTaskId = tailwindResponse.taskId;
    
    const postcssResponse = await createOrUpdateFile(projectId, 'postcss.config.js', POSTCSS_CONFIG);
    if (postcssResponse.taskId) lastTaskId = postcssResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Updating main application files (App.tsx, index files)...');
    const appResponse = await updateAppFile(projectId);
    if (appResponse.taskId) lastTaskId = appResponse.taskId;
    
    const indexResponse = await updateIndexFiles(projectId);
    if (indexResponse.taskId) lastTaskId = indexResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Installing UI dependencies...');
    const depsResponse = await installUIDependencies(projectId);
    if (depsResponse.taskId) lastTaskId = depsResponse.taskId;
    
    console.log('[DEBUG_FRONTEND_UI] Completed insertFrontendUIFiles with last taskId:', lastTaskId);
    
    return lastTaskId;
  } catch (error) {
    console.error('[DEBUG_FRONTEND_UI] Error in insertFrontendUIFiles:', error);
    return undefined;
  }
}; 