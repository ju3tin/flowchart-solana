import fs from 'fs';
import { APP_CONFIG } from '../config/appConfig';
import { createTask, updateTaskStatus } from './taskUtils';
import { exec, execSync, ExecException } from 'child_process';
import path from 'path';
import { getProjectRootPath } from './fileUtils';
import { v4 as uuidv4 } from 'uuid';
import { normalizeProjectName } from './stringUtils';
import pool from '../config/database';
import { 
  serverEnvContent, 
  serverGitignoreContent, 
  serverIndexContent, 
} from '../data/templateFiles';


function hasWarning(output: string): boolean {
  const lowercasedOutput = output.toLowerCase();
  
  if (lowercasedOutput.includes('no lockfile found') ||
      lowercasedOutput.includes('info no lockfile found')) {
    return false;
  }
  
  if (lowercasedOutput.includes('npm deprecated') && 
      lowercasedOutput.includes('this is not a bug in npm')) {
    return false;
  }
  
  return lowercasedOutput.includes('warning');
}

async function getContainerHostPort(containerName: string, containerPort = 3000, taskId: string): Promise<string> {
  try {
    const portCmd = `docker port ${containerName} ${containerPort}/tcp`;
    // Get the port mapping which looks like "0.0.0.0:randomPort"
    const portMapping = await runCommand(portCmd, '.', taskId, { skipSuccessUpdate: true });
    const portMatch = portMapping.trim().match(/:(\d+)$/);
    
    if (!portMatch) {
      console.error(`Could not parse host port from Docker output: ${portMapping}`);
      throw new Error(`Failed to get host port for container ${containerName}`);
    }
    
    return portMatch[1]; // Return the port number as a string
  } catch (error: any) {
    console.error(`Error getting container host port: ${error.message}`);
    throw error;
  }
}

export async function runCommand(
  command: string,
  cwd: string,
  taskId: string,
  options: { skipSuccessUpdate?: boolean, ensureDir?: string } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (options.ensureDir) {
      try {
        const mkdirCmd = `mkdir -p "${options.ensureDir}"`;
        console.log(`[DEBUG_DIR] Creating directory: ${options.ensureDir}`);
        execSync(mkdirCmd, { stdio: 'pipe' });
      } catch (dirError) {
        console.error(`[DEBUG_DIR] Error creating directory ${options.ensureDir}:`, dirError);
      }
    }

    exec(
      command,
      { cwd },
      async (error: ExecException | null, stdout: string, stderr: string) => {
        let result = '';

        console.log('!COMMAND:', command);
        console.log('STDOUT:', stdout);
        console.log('STDERR:', stderr);

        if (error) {
          result = `Error: ${error.message}\n\nStdout: ${stdout}\n\nStderr: ${stderr}`;
          await updateTaskStatus(taskId, 'failed', result);
          return reject(new Error(result));
        }

        if (!options.skipSuccessUpdate) {
          if (hasWarning(stdout) || (stderr && hasWarning(stderr))) {
            result = `Warning detected:\n\nStdout: ${stdout.trim()}\n\nStderr: ${stderr.trim()}`;
            await updateTaskStatus(taskId, 'warning', result);
          } else {
            result = `Success`;
            await updateTaskStatus(taskId, 'succeed', result);
          }
        }

        resolve(stdout.trim());
      }
    );
  });
};

export async function compileTs(
  tsFileName: string,
  compileCwd: string,
  distFolder = "dist"
): Promise<string> {
  const taskId = uuidv4();

  const compileCmd = `npx tsc ${tsFileName} --outDir ${distFolder} --module commonjs --target ES2020 --esModuleInterop`;

  const compileOutput = await runCommand(compileCmd, compileCwd, taskId);
  console.log("Compile output:", compileOutput);

  const baseName = path.basename(tsFileName, ".ts");
  const jsFileName = baseName + ".js";

  const jsFilePath = path.join(compileCwd, distFolder, jsFileName);

  if (!fs.existsSync(jsFilePath)) {
    const msg = `Compiled file not found at: ${jsFilePath}`;
    await updateTaskStatus(taskId, 'failed', msg);
    throw new Error(msg);
  }

  const compiledJs = fs.readFileSync(jsFilePath, "utf8");
  console.log(`Read compiled JS from: ${jsFilePath}`);

  await updateTaskStatus(taskId, 'succeed', `Compiled ${tsFileName} -> ${jsFileName}`);

  return compiledJs;
}

export const startAnchorInitTask = async (
  projectId: string,
  rootPath: string,
  projectName: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Init', creatorId, projectId);
  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      const result = await runCommand(`docker exec ${containerName} bash -c "cd /usr/src && anchor init ${rootPath}"`, '.', taskId);
      return result;
    } catch (error: any) {
      console.error('Error in anchor init task:', error);
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });
  return taskId;
};

export const startSetClusterTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Config Set Devnet', creatorId, projectId);

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }

      const rootPath = await getProjectRootPath(projectId);

      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && anchor config set cluster devnet"`, '.', taskId);
    } catch (error: any) {
      console.error('Error setting anchor cluster:', error.message);
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

function transformRootPath(rootPath: string): string {
  return rootPath.replace(/-/g, '_');
}

export const getBuildArtifactTask = async (projectId: string): Promise<{ status: string, base64So: string }> => {
  try {
    const rootPath = await getProjectRootPath(projectId);
    const transformedRootPath = transformRootPath(rootPath);
    
    // Get the container name for this project
    const containerName = await getContainerName(projectId);
    if (!containerName) {
      throw new Error(`No container found for project ${projectId}`);
    }
    
    // Create a temporary task ID for the command execution
    const tempTaskId = uuidv4();
    
    // Read the .so file directly from inside the container
    const containerSoPath = `/usr/src/${rootPath}/target/deploy/${transformedRootPath}.so`;
    
    // Check if the file exists in the container
    const fileExistsCmd = `docker exec ${containerName} bash -c "if [ -f '${containerSoPath}' ]; then echo 'exists'; else echo 'not_found'; fi"`;
    const fileExists = await runCommand(fileExistsCmd, '.', tempTaskId, { skipSuccessUpdate: true });
    
    if (fileExists.trim() !== 'exists') {
      throw new Error(`Built artifact not found in container at path: ${containerSoPath}`);
    }
    
    // Read and encode the file directly from the container
    const base64Cmd = `docker exec ${containerName} bash -c "cat '${containerSoPath}' | base64 -w 0"`;
    const base64So = await runCommand(base64Cmd, '.', tempTaskId, { skipSuccessUpdate: true });
    
    return { status: 'success', base64So };
  } catch (error) {
    console.error('Error retrieving built artifact:', error);
    return { status: 'failed', base64So: '' };
  }
};

export const startAnchorBuildTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Build', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      const rootPath = await getProjectRootPath(projectId);
      
      console.log(`Starting anchor build for project ${projectId} in container ${containerName}...`);
      
      const buildScriptContent = `#!/bin/bash
set -euo pipefail

cd /usr/src/${rootPath}

echo "===== Running anchor build ====="
anchor build
`;
      
      const tempDir = path.join(__dirname, '../../tmp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const buildScriptPath = path.join(tempDir, `build-${projectId}.sh`);
      fs.writeFileSync(buildScriptPath, buildScriptContent, 'utf8');
      
      console.log(`Created build script locally at ${tempDir}`);

      console.log(`Starting anchor build for project ${projectId}...`);
      
      try {
        await updateTaskStatus(sanitizedTaskId, 'doing', 'Anchor build in progress...');
        
        console.log(`Copying build script to container ${containerName}...`);
        await runCommand(
          `docker cp ${buildScriptPath} ${containerName}:/tmp/build.sh`,
          '.',
          sanitizedTaskId,
          { skipSuccessUpdate: true }
        );
        
        console.log(`Making build script executable...`);
        await runCommand(
          `docker exec ${containerName} chmod +x /tmp/build.sh`,
          '.',
          sanitizedTaskId,
          { skipSuccessUpdate: true }
        );
        
        console.log(`Executing build script in container ${containerName}...`);
        const buildOutput = await runCommand(
          `docker exec ${containerName} /bin/bash /tmp/build.sh`,
          '.',
          sanitizedTaskId,
          { skipSuccessUpdate: true }
        );
        
        const transformedRootPath = rootPath.replace(/-/g, '_');
        const soFileCheck = await runCommand(
          `docker exec ${containerName} /bin/bash -c "if [ -f /usr/src/${rootPath}/target/deploy/${transformedRootPath}.so ]; then echo 'BUILD_SUCCESS: .so file was created'; else echo 'BUILD_FAILURE: .so file was NOT created'; fi"`,
          '.',
          sanitizedTaskId,
          { skipSuccessUpdate: true }
        );
        
        try {
          fs.unlinkSync(buildScriptPath);
        } catch (cleanupError: any) {
          console.log(`Non-critical error cleaning up temp files: ${cleanupError.message}`);
        }
        
        if (soFileCheck.includes('BUILD_SUCCESS')) {
          await updateTaskStatus(sanitizedTaskId, 'succeed', `Build completed successfully. .so file was created.`);
        } else {
          const fullBuildError = `Build process completed but no .so file was created.\n\nBuild output: ${buildOutput}`;
          console.error(fullBuildError);
          await updateTaskStatus(sanitizedTaskId, 'failed', fullBuildError);
        }
      } catch (buildError: any) {
        console.error(`Anchor build failed with error: ${buildError.message}`);
        await updateTaskStatus(
          sanitizedTaskId,
          'failed',
          `Anchor build failed: ${buildError.message || 'Unknown build error occurred'}`
        );
        
        try {
          fs.unlinkSync(buildScriptPath);
        } catch (cleanupError: any) {
          console.log(`Non-critical error cleaning up temp files: ${cleanupError.message}`);
        }
      }
    } catch (error: any) {
      console.error(`Error in anchor build task: ${error.message}`);
      await updateTaskStatus(sanitizedTaskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startAnchorDeployTask = async (
  projectId: string,
  creatorId: string,
  ephemeralPubkey?: string
): Promise<string> => {
  const taskId = await createTask('Anchor Deploy', creatorId, projectId);
  let programId: string | null = null;
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  console.log(`[DEPLOY_DEBUG] Starting anchor deploy task ${sanitizedTaskId} for project ${projectId}${ephemeralPubkey ? ' with ephemeral key: ' + ephemeralPubkey : ''}`);

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }

      const rootPath = await getProjectRootPath(projectId);

      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && solana config set --url https://api.devnet.solana.com"`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      let walletPath;
      let containerWalletPath;
      
      if (ephemeralPubkey) {
        walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${ephemeralPubkey}.json`);
        console.log(`[DEPLOY_DEBUG] Using ephemeral key for deployment: ${ephemeralPubkey}`);
        console.log(`[DEPLOY_DEBUG] Ephemeral key file path: ${walletPath}`);
        
        if (!fs.existsSync(walletPath)) {
          console.error(`[DEPLOY_DEBUG] ERROR: Ephemeral key file not found at ${walletPath}`);
          throw new Error(`Ephemeral key file not found at ${walletPath}`);
        }
        
        try {
          const fileStats = fs.statSync(walletPath);
          console.log(`[DEPLOY_DEBUG] Key file exists: ${walletPath}, size: ${fileStats.size} bytes`);
          
          const keyContent = fs.readFileSync(walletPath, 'utf8');
          const keyArray = JSON.parse(keyContent);
          console.log(`[DEPLOY_DEBUG] Key array length: ${keyArray.length}, first few bytes: [${keyArray.slice(0, 3).join(', ')}...]`);
          if (keyArray.length !== 64) {
            console.warn(`[DEPLOY_DEBUG] WARNING: Key file does not contain a 64-byte array! Found ${keyArray.length} bytes.`);
          }
        } catch (err: any) {
          console.error(`[DEPLOY_DEBUG] ERROR reading key file: ${err.message}`);
          throw new Error(`Error reading ephemeral key file: ${err.message}`);
        }
        
        containerWalletPath = `/tmp/${ephemeralPubkey}.json`;
        console.log(`[DEPLOY_DEBUG] Copying ephemeral key to container path: ${containerWalletPath}`);
        
        await runCommand(`docker cp ${walletPath} ${containerName}:${containerWalletPath}`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
        
        try {
          const fileCheckCmd = `docker exec ${containerName} ls -la ${containerWalletPath}`;
          const fileCheckResult = await runCommand(fileCheckCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          console.log(`[DEPLOY_DEBUG] Container key file check: ${fileCheckResult}`);
          
          const pubkeyCmd = `docker exec ${containerName} bash -c "solana-keygen pubkey ${containerWalletPath} || echo 'KEYGEN_FAILED'"`;
          const pubkeyResult = await runCommand(pubkeyCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          console.log(`[DEPLOY_DEBUG] Solana-keygen pubkey result: ${pubkeyResult.trim()}`);
          
          if (pubkeyResult.trim() !== ephemeralPubkey) {
            console.error(`[DEPLOY_DEBUG] ERROR: Key verification failed! Expected: ${ephemeralPubkey}, Got: ${pubkeyResult.trim()}`);
            throw new Error(`Ephemeral key verification failed. Expected: ${ephemeralPubkey}, Got: ${pubkeyResult.trim()}`);
          } else {
            console.log(`[DEPLOY_DEBUG] Key verification SUCCESS: ${pubkeyResult.trim()}`);
          }
          
          const anchorTomlCmd = `docker exec ${containerName} bash -c "cat /usr/src/${rootPath}/Anchor.toml || echo 'ANCHOR_TOML_NOT_FOUND'"`;
          const anchorTomlContent = await runCommand(anchorTomlCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          
          const walletLineMatch = anchorTomlContent.match(/wallet\s*=\s*["']([^"']+)["']/);
          if (walletLineMatch) {
            const walletPath = walletLineMatch[1];
            console.log(`[DEPLOY_DEBUG] Found wallet setting in Anchor.toml: ${walletPath}`);
            
            if (walletPath.includes('id.json') || walletPath.includes('~')) {
              console.warn(`[DEPLOY_DEBUG] WARNING: Anchor.toml specifies default wallet: ${walletPath}`);
              console.warn(`[DEPLOY_DEBUG] This might override command-line flags in some Anchor versions`);
              
              try {
                const modifiedToml = anchorTomlContent.replace(
                  /wallet\s*=\s*["'][^"']+["']/,
                  `wallet = "${containerWalletPath}"`
                );
                
                const updateTomlCmd = `docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/Anchor.toml" << 'EOF'\n${modifiedToml}\nEOF`;
                await runCommand(updateTomlCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
                console.log(`[DEPLOY_DEBUG] Updated Anchor.toml to use ephemeral key: ${containerWalletPath}`);
                
                const verifyTomlCmd = `docker exec ${containerName} bash -c "cat /usr/src/${rootPath}/Anchor.toml | grep wallet"`;
                const verifyResult = await runCommand(verifyTomlCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
                console.log(`[DEPLOY_DEBUG] Verified Anchor.toml wallet setting: ${verifyResult.trim()}`);
              } catch (tomlUpdateErr: any) {
                console.error(`[DEPLOY_DEBUG] Error updating Anchor.toml: ${tomlUpdateErr.message}`);
              }
            }
          } else {
            console.log(`[DEPLOY_DEBUG] No wallet setting found in Anchor.toml. Command-line flags should work.`);
          }
        } catch (verifyErr: any) {
          console.error(`[DEPLOY_DEBUG] Error during key verification: ${verifyErr.message}`);
        }
        
        await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && solana config set --keypair ${containerWalletPath}"`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      } else {
        walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${creatorId}.json`);
        console.log(`Using creator key for deployment: ${creatorId}`);
        
        containerWalletPath = `/tmp/${creatorId}.json`;
        await runCommand(`docker cp ${walletPath} ${containerName}:${containerWalletPath}`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
        
        await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && solana config set --keypair ${containerWalletPath}"`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      }
      
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && solana config set --url devnet"`, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      const anchorDeployCmd = `anchor deploy \
        --provider.wallet ${containerWalletPath} \
        --provider.cluster devnet`;
      
      console.log(`Running deploy with wallet flag: --provider.wallet ${containerWalletPath}`);
      
      console.log(`[EPHEMERAL_DEBUG] Checking Anchor.toml configuration...`);
      try {
        const anchorTomlCmd = `docker exec ${containerName} bash -c "cat /usr/src/${rootPath}/Anchor.toml || echo 'ANCHOR_TOML_NOT_FOUND'"`;
        const anchorTomlContent = await runCommand(anchorTomlCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
        
        const walletMatch = anchorTomlContent.match(/wallet\s*=\s*["']([^"']+)["']/);
        if (walletMatch) {
          console.log(`[EPHEMERAL_DEBUG] Found wallet in Anchor.toml: ${walletMatch[1]}`);
          
          if (walletMatch[1].includes('id.json')) {
            console.warn(`[EPHEMERAL_DEBUG] WARNING: Anchor.toml specifies default wallet: ${walletMatch[1]}`);
            console.warn(`[EPHEMERAL_DEBUG] This might override command-line flags in some Anchor versions`);
          }
        } else {
          console.log(`[EPHEMERAL_DEBUG] No wallet setting found in Anchor.toml, command-line flags should work`);
        }
      } catch (tomlErr: any) {
        console.error(`[EPHEMERAL_DEBUG] Error checking Anchor.toml: ${tomlErr.message}`);
      }
      
      const deployCmd = `docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && anchor deploy --provider.wallet ${containerWalletPath} --provider.cluster devnet 2>&1"`;
      console.log(`[DEPLOY_DEBUG] Running command: ${deployCmd}`);
      
      const result = await runCommand(deployCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true }).catch(async (error: any) => {
        console.error('Error during deployment:', sanitizedTaskId, error);
        
        console.log(`[EPHEMERAL_DEBUG] Deployment failed. Trying direct anchor deploy with -k flag...`);
        try {
          const directDeployCmd = `docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && anchor deploy -k ${containerWalletPath} --url devnet 2>&1"`;
          console.log(`[DEPLOY_DEBUG] Running fallback command: ${directDeployCmd}`);
          const fallbackResult = await runCommand(directDeployCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          console.log(`[EPHEMERAL_DEBUG] Direct deploy result (first 1000 chars):\n${fallbackResult.substring(0, 1000)}`);
          
          if (fallbackResult.includes('Program Id:')) {
            console.log(`[EPHEMERAL_DEBUG] Direct deploy succeeded!`);
            return fallbackResult;
          }
        } catch (fallbackErr: any) {
          console.error(`[EPHEMERAL_DEBUG] Fallback deploy also failed: ${fallbackErr.message}`);
        }
        
        const errorResult = JSON.stringify({
          status: 'failed',
          error: error.message
        });
        await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
        return `Error: ${error.message}`;
      });

      console.log(`[DEPLOY_DEBUG] Full deploy output (first 1000 chars):\n${result?.substring(0, 1000)}`);

      if (result && result.startsWith('Error:')) {
        console.error(`Deployment failed for Task ID: ${sanitizedTaskId}. Reason: ${result}`);
        const errorResult = JSON.stringify({
          status: 'failed',
          error: result
        });
        await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
        return;
      }

      console.log(`[DEPLOY_DEBUG] Searching for Program Id in output...`);
      const programIdRegex = /Program Id:\s*([a-zA-Z0-9]{32,44})/;
      const programIdMatch = result?.match(programIdRegex);
      
      if (programIdMatch) {
        console.log(`[DEPLOY_DEBUG] Found Program Id: ${programIdMatch[1]}`);
        programId = programIdMatch[1];
      } else {
        console.log(`[DEPLOY_DEBUG] WARNING: No Program Id found in output! Searching the entire output for base58-like strings...`);
        
        const base58Regex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
        const potentialIds = result?.match(base58Regex) || [];
        if (potentialIds.length > 0) {
          console.log(`[DEPLOY_DEBUG] Found potential base58 program IDs: ${potentialIds.join(', ')}`);
          
          if (potentialIds.length > 0) {
            programId = potentialIds[0] || null;
            console.log(`[DEPLOY_DEBUG] Using first potential base58 string as Program ID: ${programId}`);
          }
        } else {
          console.log(`[DEPLOY_DEBUG] No base58-like strings found in output!`);
          const errorResult = JSON.stringify({
            status: 'failed',
            error: 'Program ID not found in deploy output'
          });
          await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
          throw new Error('Program ID not found in deploy output. Deployment may have failed.');
        }
      }

      console.log(`[DEPLOY_DEBUG] Using Program ID: ${programId}`);
      
      if (programId) console.log(`Program successfully deployed with ID: ${programId}`);
      
      try {
        if (programId && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(programId)) {
          console.error(`[DEPLOY_DEBUG] ERROR: Invalid program ID format: ${programId}`);
          const errorResult = JSON.stringify({
            status: 'failed',
            error: `Invalid program ID format: ${programId}`
          });
          await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
          throw new Error(`Invalid program ID format: ${programId}`);
        }
        
        if (!programId) {
          console.error(`[DEPLOY_DEBUG] ERROR: Program ID is null or undefined`);
          const errorResult = JSON.stringify({
            status: 'failed',
            error: 'Program ID is null or undefined'
          });
          await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
          throw new Error('Program ID is null or undefined');
        }
        
        const checkProgramCmd = `docker exec ${containerName} bash -c "solana program show ${programId} --url devnet || echo 'PROGRAM_NOT_FOUND'"`;
        const checkProgramResult = await runCommand(checkProgramCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
        console.log(`[DEPLOY_DEBUG] Program verification: ${checkProgramResult.substring(0, 500)}`);
        
        if (checkProgramResult.includes('PROGRAM_NOT_FOUND')) {
          console.warn(`[DEPLOY_DEBUG] WARNING: Program ${programId} not found on devnet. It may not be deployed properly.`);
        } else {
          console.log(`[DEPLOY_DEBUG] Program ${programId} successfully verified on devnet.`);
        }
      } catch (verifyProgramErr: any) {
        console.error(`[DEPLOY_DEBUG] Error verifying program ID: ${verifyProgramErr.message}`);
      }
      
      const successResult = JSON.stringify({
        status: 'success',
        programId: programId
      });
      
      console.log(`[DEPLOY_DEBUG] Final program ID to be returned to client: '${programId}'`);
      console.log(`[DEPLOY_DEBUG] Task result JSON: ${successResult}`);
      
      await updateTaskStatus(
        sanitizedTaskId,
        'succeed',
        successResult
      );
    } catch (error: any) {
      console.error('Error during deployment:', sanitizedTaskId, error);
      const errorResult = JSON.stringify({
        status: 'failed',
        error: error.message
      });
      await updateTaskStatus(sanitizedTaskId, 'failed', errorResult);
      return;
    }
  });

  return sanitizedTaskId;
};

export const startAnchorTestTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Test', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      const rootPath = await getProjectRootPath(projectId);
      
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && anchor test"`, '.', taskId);
    } catch (error: any) {
      await updateTaskStatus(sanitizedTaskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startCustomCommandTask = async (
  projectId: string,
  creatorId: string,
  commandType: 'anchor clean' | 'cargo clean' | 'runFunction',
  functionName?: string,
  parameters?: any[],
  ephemeralPubkey?: string,
): Promise<string> => {
  const taskId = await createTask(
    commandType === 'runFunction' ? `Run Function: ${functionName}` : commandType, 
    creatorId, 
    projectId
  );

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      if (commandType === 'runFunction' && functionName) {
        await updateTaskStatus(taskId, 'doing', `Executing function ${functionName}...`);
        try {
          const output = await runUserProjectCode(projectId, taskId, functionName, parameters, ephemeralPubkey);
          if (output.includes('ERROR:')) {
            throw new Error(output.split('ERROR:')[1].trim());
          }
          try {
            const parsedResult = JSON.parse(output);
            await updateTaskStatus(taskId, 'succeed', JSON.stringify(parsedResult));
          } catch (parseError) {
            const wrappedResult = { message: output };
            await updateTaskStatus(taskId, 'succeed', JSON.stringify(wrappedResult));
          }
        } catch (error: any) {
          console.error(`Error executing function:`, error);
          await updateTaskStatus(taskId, 'failed', `Error executing function: ${error.message}`);
        }
      } else {
        const rootPath = await getProjectRootPath(projectId);
        
        await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && ${commandType}"`, '.', taskId);
      }
    } catch (error: any) {
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startInstallPackagesTask = async (
  projectId: string,
  creatorId: string,
  _packages?: string[]
): Promise<string> => {
  const taskId = await createTask('Install NPM Packages', creatorId, projectId);

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      const rootPath = await getProjectRootPath(projectId);
      
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npm install @coral-xyz/anchor"`, '.', taskId);
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npm install @solana/web3.js"`, '.', taskId);
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npm install @solana/spl-token"`, '.', taskId);
      await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npm install fs"`, '.', taskId);

      if (_packages) {
        for (const _package of _packages) {
          await runCommand(`docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npm install ${_package}"`, '.', taskId);
        }
      }
    } catch (error: any) {
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

function hybridRootPackageJson(projectName: string, projectDesc: string = 'A React application') {
  return {
    name: projectName
      .toLowerCase()
      .replace(/\s+/g, '-'),  
    version: '0.1.0',
    description: projectDesc,
    private: true,
    scripts: {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
      "web-vitals": "^2.1.4",
      "@testing-library/jest-dom": "^5.16.5",
      "@testing-library/react": "^13.4.0",
      "@testing-library/user-event": "^13.5.0"
    },
    devDependencies: {
      "@types/react": "^18.0.28",
      "@types/react-dom": "^18.0.11",
      "@types/node": "^16.18.12",
      "@types/jest": "^27.5.2",
      "typescript": "^4.9.5"
    },
    eslintConfig: {
      "extends": [
        "react-app",
        "react-app/jest"
      ]
    },
    browserslist: {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  };
}

export const startCreateProjectDirectoryTask = async (
  creatorId: string,
  rootPath: string,
  projectId: string,
  projectDesc: string = 'A React application'
): Promise<string> => {
  if (!projectId) {
    throw new Error('Project ID is required for creating a project directory');
  }

  console.log(`[DEBUG_CONTAINER] Starting createProjectDirectoryTask for projectId=${projectId}, rootPath=${rootPath}`);

  const taskId = await createTask('Create Project Directory', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');
  console.log(`[DEBUG_CONTAINER] Created task with ID: ${sanitizedTaskId} for projectId=${projectId}`);

  setImmediate(async () => {
    try {
      const containerName = `userproj-${projectId}-${Date.now()}`;
      console.log(`[DEBUG_CONTAINER] Creating container ${containerName} for project ${projectId}`);
      
      const startContainerCmd = 
        `docker run -d \\
          --name ${containerName} \\
          -p 0.0.0.0::3000 \\
          flowcode-project-base:latest \\
          bash -c "cd /usr/src && tail -f /dev/null"
      `;
      console.log(`[DEBUG_CONTAINER] About to execute docker run command: ${startContainerCmd}`);
      await runCommand(startContainerCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      console.log(`[DEBUG_CONTAINER] Docker container created: name=${containerName}, about to get host port and update DB`);

      try {
        const hostPort = await getContainerHostPort(containerName, 3000, sanitizedTaskId);
        const containerUrl = `http://localhost:${hostPort}`;
        console.log(`[DEBUG_CONTAINER] Setting containerUrl=${containerUrl} for container=${containerName}, projectId=${projectId}`);

        const updateResult = await pool.query(
          'UPDATE solanaproject SET container_name = $1, container_url = $2 WHERE id = $3',
          [containerName, containerUrl, projectId]
        );
        console.log(`[DEBUG_CONTAINER] DB updated with container_name=${containerName}, container_url=${containerUrl} for projectId=${projectId}. Rows affected:`, updateResult.rowCount);
        
        const verifyResult = await pool.query(
          'SELECT container_name, container_url FROM solanaproject WHERE id = $1',
          [projectId]
        );
        if (verifyResult.rows.length > 0) {
          console.log(`[DEBUG_CONTAINER] Verified DB update: container_name=${verifyResult.rows[0].container_name}, container_url=${verifyResult.rows[0].container_url} for projectId=${projectId}`);
        } else {
          console.log(`[DEBUG_CONTAINER] Failed to verify DB update, no rows found for projectId=${projectId}`);
        }
      } catch (dbError: any) {
        console.error('[DEBUG_CONTAINER] Error storing container info in DB:', dbError);
      }

      console.log(`[DEBUG_CONTAINER] Running anchor init ${rootPath} in container ${containerName}`);
      const anchorInitCmd = 
        `docker exec ${containerName} bash -c "cd /usr/src && anchor init ${rootPath}"
      `;
      await runCommand(anchorInitCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(`docker exec ${containerName} ls -l /usr/src/${rootPath}`, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      const craCmd = `
        docker exec ${containerName} bash -c "cd /usr/src/${rootPath} && npx create-react-app@latest app --template typescript"
      `;
      await runCommand(craCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(`docker exec ${containerName} ls -l /usr/src/${rootPath}/app`, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      const customPkg = hybridRootPackageJson(rootPath, projectDesc);
      const packageJsonCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/app/package.json" << 'EOF'
${JSON.stringify(customPkg, null, 2)}
EOF`;
      await runCommand(packageJsonCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      await runCommand(
        `docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/app && npm install"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const readMeCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/app/README.md" << 'EOF'
# ${rootPath}

${projectDesc}

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
EOF`;
      await runCommand(readMeCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(
        `docker exec ${containerName} ls -la /usr/src/${rootPath}`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );
      
      await runCommand(
        `docker exec ${containerName} mkdir -p -v /usr/src/${rootPath}/server/src`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );
      
      await runCommand(
        `docker exec ${containerName} ls -la /usr/src/${rootPath}`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );
      
      await runCommand(
        `docker exec ${containerName} ls -ld /usr/src/${rootPath}`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );
      
      await runCommand(
        `docker exec ${containerName} ls -la /usr/src/${rootPath}/server || echo "Server directory not found"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const customServerPkg = {
        name: `${rootPath.toLowerCase().replace(/\s+/g, '-')}-server`,
        version: '0.1.0',
        description: 'Express server for React application',
        main: 'dist/index.js',
        scripts: {
          "start": "node dist/index.js",
          "dev": "nodemon --exec ts-node src/index.ts",
          "build": "tsc"
        },
        dependencies: {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "dotenv": "^16.0.3",
          "helmet": "^6.0.1"
        },
        devDependencies: {
          "typescript": "^4.9.5",
          "@types/express": "^4.17.17",
          "@types/cors": "^2.8.13",
          "@types/node": "^18.14.0",
          "nodemon": "^2.0.20",
          "ts-node": "^10.9.1"
        }
      };
      
      const serverPackageJsonCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/server/package.json" << 'EOF'
${JSON.stringify(customServerPkg, null, 2)}
EOF`;
      await runCommand(serverPackageJsonCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      await runCommand(
        `docker exec ${containerName} ls -la /usr/src/${rootPath}/server || echo "Server directory not found after package.json"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );
      
      await runCommand(
        `docker exec ${containerName} cat /usr/src/${rootPath}/server/package.json || echo "Could not read package.json"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const serverIndexCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/server/src/index.ts" << 'EOF'
${serverIndexContent}
EOF`;
      await runCommand(serverIndexCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      const serverEnvCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/server/.env" << 'EOF'
${serverEnvContent}
EOF`;
      await runCommand(serverEnvCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      await runCommand(
        `docker exec ${containerName} ls -la /usr/src/${rootPath}/server/src || echo "Server src directory not found"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      await runCommand(
        `docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/server && npm install"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const serverTsConfig = {
        "compilerOptions": {
          "target": "ES2020",
          "module": "commonjs",
          "outDir": "dist",
          "rootDir": "src",
          "esModuleInterop": true,
          "strict": true
        },
        "include": ["src/**/*"]
      };

      const serverTsConfigCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/server/tsconfig.json" << 'EOF'
${JSON.stringify(serverTsConfig, null, 2)}
EOF`;
      await runCommand(serverTsConfigCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(`docker exec ${containerName} ls -la /usr/src/${rootPath}/server`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      await runCommand(
        `docker inspect ${containerName} | grep -A 20 "Mounts"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const appGitignoreCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/app/.gitignore" << 'EOF'
${serverGitignoreContent}
EOF`;
      await runCommand(appGitignoreCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      const serverGitignoreCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/server/.gitignore" << 'EOF'
${serverGitignoreContent}
EOF`;
      await runCommand(serverGitignoreCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      console.log("Attempting git initialization to verify filesystem...");
      await runCommand(`
        docker exec ${containerName} bash -c "
          cd /usr/src/${rootPath} &&
          echo 'Initializing git repository...' &&
          git init &&
          echo 'Checking git status...' &&
          git status &&
          echo 'Showing directory listing after git init...' &&
          ls -la &&
          echo 'Git initialization tests complete.'
        "
      `, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(
        `docker inspect --format='{{.Config.Image}}' ${containerName} && docker history $(docker inspect --format='{{.Config.Image}}' ${containerName})`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      console.log(`[DEBUG_CONTAINER] Final verification of directory structure for container ${containerName}...`);
      const finalVerification = await runCommand(
        `docker exec ${containerName} bash -c "
          echo 'Full directory listing of /usr/src:' &&
          ls -la /usr/src &&
          echo '' &&
          echo 'Full directory listing of /usr/src/${rootPath}:' &&
          ls -la /usr/src/${rootPath} &&
          echo '' &&
          echo 'Server directory exists?' &&
          [ -d /usr/src/${rootPath}/server ] && echo 'YES' || echo 'NO' &&
          echo '' &&
          echo 'App directory exists?' &&
          [ -d /usr/src/${rootPath}/app ] && echo 'YES' || echo 'NO'
        "
      `, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      
      if (finalVerification.includes('Server directory exists?\nNO')) {
        console.warn(`[DEBUG_CONTAINER] WARNING: Server directory does not exist in container ${containerName} despite all commands succeeding`);
        
        await runCommand(
          `docker exec ${containerName} bash -c "
            echo 'Attempting to recreate server directory...' &&
            mkdir -p -v /usr/src/${rootPath}/server/src &&
            echo 'Directory created, checking again:' &&
            ls -la /usr/src/${rootPath} &&
            [ -d /usr/src/${rootPath}/server ] && echo 'NOW EXISTS' || echo 'STILL MISSING'
          "
        `, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      }
      
      const runNpmStartCmd = 
        `docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/app && export CI=true && export BROWSER=none && export HOST=0.0.0.0 && export PORT=3000 && npm start > /usr/src/${rootPath}/app/cra-startup.log 2>&1 &"
      `;
      await runCommand(runNpmStartCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
      console.log(`[DEBUG_CONTAINER] CRA dev server is now starting with forced environment variables...`);

      await runCommand(`sleep 3`, '.', sanitizedTaskId, { skipSuccessUpdate: true });

      await runCommand(
        `docker exec ${containerName} bash -c "ps aux | grep 'react-scripts start' | grep -v grep || echo 'CRA process not found!'"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      console.log(`[DEBUG_CONTAINER] Checking CRA startup logs...`);
      await runCommand(
        `docker exec ${containerName} bash -c "cat /usr/src/${rootPath}/app/cra-startup.log || echo 'No startup log found'"`,
        '.',
        sanitizedTaskId,
        { skipSuccessUpdate: true }
      );

      const isServerReady = await waitForServerReady(containerName);
      console.log(`[DEBUG_CONTAINER] Server ready check result: ${isServerReady ? 'READY' : 'NOT READY'}`);
      
      if (isServerReady) {
        console.log(`[DEBUG_CONTAINER] About to mark task as success. taskId=${sanitizedTaskId}, containerName=${containerName}, projectId=${projectId}`);
        await updateTaskStatus(
          sanitizedTaskId,
          'succeed',
          `Project created successfully! Anchor project in /usr/src/${rootPath}, CRA in /usr/src/${rootPath}/app, Express in /usr/src/${rootPath}/server, container: ${containerName}`
        );
        console.log(`[DEBUG_CONTAINER] Task marked as succeed. taskId=${sanitizedTaskId}`);
        
        try {
          const finalCheckResult = await pool.query(
            'SELECT container_url FROM solanaproject WHERE id = $1',
            [projectId]
          );
          if (finalCheckResult.rows.length > 0) {
            console.log(`[DEBUG_CONTAINER] Final DB check: container_url=${finalCheckResult.rows[0].container_url} for projectId=${projectId}`);
          } else {
            console.log(`[DEBUG_CONTAINER] Final DB check: no rows found for projectId=${projectId}`);
          }
        } catch (finalDbError) {
          console.error('[DEBUG_CONTAINER] Error checking DB in final verification:', finalDbError);
        }
      } else {
        console.log(`[DEBUG_CONTAINER] About to mark task as success despite server not ready. taskId=${sanitizedTaskId}`);
        await updateTaskStatus(
          sanitizedTaskId,
          'succeed',
          `Project created! Container: ${containerName}. Anchor project in /usr/src/${rootPath}. Note: CRA dev server is still starting up and may need a few more moments.`
        );
        console.log(`[DEBUG_CONTAINER] Task marked as succeed. taskId=${sanitizedTaskId}`);
      }

    } catch (error: any) {
      console.error('[DEBUG_CONTAINER] Error creating project:', error);
      await updateTaskStatus(
        sanitizedTaskId,
        'failed',
        `Error creating project directory: ${error.message}`
      );
      console.log(`[DEBUG_CONTAINER] Task marked as failed. taskId=${sanitizedTaskId}`);
    }
  });

  return sanitizedTaskId;
};

export const closeProjectContainer = async (
  projectId: string,
  creatorId: string,
  commitBeforeClose: boolean = false,
  removeContainer: boolean = false
): Promise<string> => {
  const taskId = await createTask('Close Project Container', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const containerName = await getContainerName(projectId);
      
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      console.log(`Closing container ${containerName} for project ${projectId}`);
      
      if (commitBeforeClose) {
        try {
          const checkGitCmd = `docker exec ${containerName} bash -c "if [ -d /usr/src/.git ]; then echo 'git-exists'; else echo 'no-git'; fi"`;
          const gitExists = await runCommand(checkGitCmd, '.', sanitizedTaskId);
          
          if (gitExists.trim() === 'git-exists') {
            console.log(`Git repository found in container ${containerName}, committing changes...`);
            
            const commitCmd = `
              docker exec ${containerName} bash -c "
                cd /usr/src &&
                git add . &&
                git commit -m 'Changes before container close - $(date)' || true &&
                git push origin main || true
              "
            `;
            await runCommand(commitCmd, '.', sanitizedTaskId);
          } else {
            console.log(`No Git repository found in container ${containerName}, skipping commit`);
          }
        } catch (gitError: any) {
          console.error(`Error during Git operations:`, gitError);
        }
      }
      
      if (removeContainer) {
        await runCommand(`docker rm -f ${containerName}`, '.', sanitizedTaskId);
        console.log(`Container ${containerName} forcibly stopped and removed`);
        
        await pool.query(
          'UPDATE solanaproject SET container_name = NULL WHERE id = $1',
          [projectId]
        );
      } else {
        await runCommand(`docker stop ${containerName}`, '.', sanitizedTaskId);
        console.log(`Container ${containerName} stopped successfully`);
      }
      
      await updateTaskStatus(
        sanitizedTaskId,
        'succeed',
        `Container ${containerName} for project ${projectId} ${removeContainer ? 'stopped and removed' : 'stopped'} successfully`
      );
    } catch (error: any) {
      console.error(`Error closing project container:`, error);
      await updateTaskStatus(
        sanitizedTaskId,
        'failed',
        `Error closing project container: ${error.message}`
      );
    }
  });
  
  return sanitizedTaskId;
};

export const startProjectContainer = async (
  projectId: string,
  creatorId: string,
  rootPath?: string
): Promise<string> => {
  const taskId = await createTask('Start Project Container', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const existingContainer = await getContainerName(projectId);
      
      if (existingContainer) {
        console.log(`Found existing container ${existingContainer} for project ${projectId}`);
        
        const checkContainerCmd = `docker ps -a --filter "name=${existingContainer}" --format "{{.Status}}"`;
        const containerStatus = await runCommand(checkContainerCmd, '.', sanitizedTaskId);
        
        if (containerStatus.toLowerCase().includes('exited')) {
          console.log(`Starting existing container ${existingContainer}...`);
          await runCommand(`docker start ${existingContainer}`, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          
          console.log(`Restarting CRA dev server in container ${existingContainer}...`);
          const runNpmStartCmd = `
            docker exec ${existingContainer} bash -c "cd /usr/src/app && export CI=true && export BROWSER=none && export HOST=0.0.0.0 && export PORT=3000 && npm start > /usr/src/app/cra-startup.log 2>&1 &"
          `;
          await runCommand(runNpmStartCmd, '.', sanitizedTaskId, { skipSuccessUpdate: true });
          
          const isServerReady = await waitForServerReady(existingContainer);
          
          if (isServerReady) {
            await updateTaskStatus(
              sanitizedTaskId,
              'succeed',
              `Existing container ${existingContainer} started successfully and CRA server is ready`
            );
          } else {
            await updateTaskStatus(
              sanitizedTaskId,
              'succeed',
              `Existing container ${existingContainer} started successfully. CRA server is still starting up.`
            );
          }
        } else if (containerStatus.toLowerCase().includes('up')) {
          console.log(`Container ${existingContainer} is already running`);
          await updateTaskStatus(
            sanitizedTaskId,
            'succeed',
            `Container ${existingContainer} is already running`
          );
        } else {
          if (!rootPath) {
            await updateTaskStatus(
              sanitizedTaskId,
              'failed',
              `Container ${existingContainer} not found and rootPath not provided to create a new one`
            );
            return;
          }
          
          const newContainerName = `userproj-${projectId}-${Date.now()}`;
          console.log(`Creating new container ${newContainerName} for project ${projectId}`);
          await createNewContainer(newContainerName, projectId, sanitizedTaskId);
        }
      } else {
        if (!rootPath) {
          await updateTaskStatus(
            sanitizedTaskId,
            'failed',
            `No container found for project ${projectId} and rootPath not provided to create a new one`
          );
          return;
        }
        
        const newContainerName = `userproj-${projectId}-${Date.now()}`;
        console.log(`No existing container found. Creating new container ${newContainerName} for project ${projectId}`);
        await createNewContainer(newContainerName, projectId, sanitizedTaskId);
      }
    } catch (error: any) {
      console.error(`Error starting project container:`, error);
      await updateTaskStatus(
        sanitizedTaskId,
        'failed',
        `Error starting project container: ${error.message}`
      );
    }
  });
  
  return sanitizedTaskId;
};

async function createNewContainer(
  containerName: string,
  projectId: string,
  taskId: string
): Promise<void> {
  const startContainerCmd = `
    docker run -d \\
      --name ${containerName} \\
      -p 0.0.0.0::3000 \\
      flowcode-project-base:latest \\
      bash -c "cd /usr/src && tail -f /dev/null"
  `;
  await runCommand(startContainerCmd, '.', taskId, { skipSuccessUpdate: true });
  
  const hostPort = await getContainerHostPort(containerName, 3000, taskId);
  const containerUrl = `http://localhost:${hostPort}`;
  
  await pool.query(
    'UPDATE solanaproject SET container_name = $1, container_url = $2 WHERE id = $3',
    [containerName, containerUrl, projectId]
  );
  
  const rootPathResult = await pool.query(
    'SELECT name FROM solanaproject WHERE id = $1',
    [projectId]
  );
  
  let rootPath = '';
  if (rootPathResult.rows.length > 0) {
    rootPath = normalizeProjectName(rootPathResult.rows[0].name);
  } else {
    rootPath = `project-${projectId}`;
  }
  
  const anchorInitCmd = `
    docker exec ${containerName} bash -c "cd /usr/src && anchor init ${rootPath}"
  `;
  await runCommand(anchorInitCmd, '.', taskId, { skipSuccessUpdate: true });
  
  const runNpmStartCmd = `
    docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/app && export CI=true && export BROWSER=none && export HOST=0.0.0.0 && export PORT=3000 && npm start > /usr/src/${rootPath}/app/cra-startup.log 2>&1 &"
  `;
  await runCommand(runNpmStartCmd, '.', taskId, { skipSuccessUpdate: true });
  console.log(`CRA dev server starting in container ${containerName} with forced environment variables`);
  
  const isServerReady = await waitForServerReady(containerName);
  
  if (isServerReady) {
    await updateTaskStatus(
      taskId,
      'succeed',
      `New container ${containerName} created successfully and CRA server is ready`
    );
  } else {
    await updateTaskStatus(
      taskId,
      'succeed',
      `New container ${containerName} created successfully. CRA server is still starting up.`
    );
  }
}

export const startInstallNodeDependenciesTask = async (
  projectId: string,
  creatorId: string,
  packages: string[],
  targetDir: 'app' | 'server' = 'app'
): Promise<string> => {
  const taskId = await createTask('Install Node Dependencies', creatorId, projectId);
  console.log(`Starting node dependency installation task for project ${projectId} with packages:`, packages);

  setImmediate(async () => {
    try {
      if (packages.length === 0) {
        console.log(`No packages to install for project ${projectId}`);
        await updateTaskStatus(taskId, 'succeed', 'No packages to install');
        return;
      }
      
      const containerName = await getContainerName(projectId);
      
      if (!containerName) {
        throw new Error(`No container found for project ${projectId}`);
      }
      
      const rootPathResult = await pool.query(
        'SELECT name FROM solanaproject WHERE id = $1',
        [projectId]
      );
      
      let rootPath = '';
      if (rootPathResult.rows.length > 0) {
        rootPath = normalizeProjectName(rootPathResult.rows[0].name);
      } else {
        throw new Error(`Could not determine project name for project ${projectId}`);
      }
      
      console.log(`Found container ${containerName} for project ${projectId}`);
      
      await updateTaskStatus(taskId, 'doing', `Installing ${packages.join(', ')} in ${targetDir}...`);
      console.log(`Installing packages: ${packages.join(', ')} for project ${projectId} in ${targetDir}`);
      
      const installCommand = `npm install ${packages.join(' ')}`;
      console.log(`Install command: ${installCommand}`);
      
      try {
        const dockerInstallCmd = `docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/${targetDir} && ${installCommand}"`;
        console.log(`Executing in container: ${dockerInstallCmd}`);
        
        await runCommand(dockerInstallCmd, '.', taskId);
        console.log(`Successfully installed packages in container ${containerName} (${targetDir})`);
        await updateTaskStatus(taskId, 'succeed', `Successfully installed dependencies in container ${containerName} (${targetDir})`);
      } catch (error: any) {
        console.error(`Failed to install packages in container. Error:`, error);
        await updateTaskStatus(taskId, 'failed', `Error installing dependencies: ${error.message}`);
      }
    } catch (error: any) {
      console.error(`Error in startInstallNodeDependenciesTask:`, error);
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export async function runUserProjectCode(
  projectId: string,
  taskId: string,
  functionName: string,
  parameters: any,
  ephemeralPubkey?: string
): Promise<string> {
  const containerName = await getContainerName(projectId);
  
  if (!containerName) {
    throw new Error(`No container found for project ${projectId}`);
  }
  
  const rootPathResult = await pool.query(
    'SELECT name FROM solanaproject WHERE id = $1',
    [projectId]
  );
  
  let rootPath = '';
  if (rootPathResult.rows.length > 0) {
    rootPath = normalizeProjectName(rootPathResult.rows[0].name);
  } else {
    throw new Error(`Could not determine project name for project ${projectId}`);
  }
  
  console.log(`Found container ${containerName} for project ${projectId}`);
  
  const tempRunnerDir = `/usr/src/${rootPath}/app/_temp_${taskId}`;
  await runCommand(`docker exec ${containerName} mkdir -p ${tempRunnerDir}`, '.', taskId);

  const runnerSrcPath = path.join(__dirname, '../../runners/myRunnerTemplate.ts');
  const ephemeralSrcPath = path.join(__dirname, '../../runners/ephemeralKeyUtils.ts');
  const localBundlrSrcPath = path.join(__dirname, '../../runners/localBundlrUtils.ts');

  await runCommand(`docker cp ${runnerSrcPath} ${containerName}:${tempRunnerDir}/runner.ts`, '.', taskId);
  await runCommand(`docker cp ${ephemeralSrcPath} ${containerName}:${tempRunnerDir}/ephemeralKeyUtils.ts`, '.', taskId);
  await runCommand(`docker cp ${localBundlrSrcPath} ${containerName}:${tempRunnerDir}/localBundlrUtils.ts`, '.', taskId);

  let finalParams: any;
  if (Array.isArray(parameters)) {
    finalParams = ephemeralPubkey ? [...parameters, ephemeralPubkey] : parameters;
  } else {
    finalParams = ephemeralPubkey ? { ...parameters, ephemeralPubkey } : parameters;
  }

  const paramsContent = JSON.stringify(finalParams, null, 2);
  const writeParamsCmd = `docker exec -i ${containerName} bash -c "cat > ${tempRunnerDir}/params.json" << 'EOF'
${paramsContent}
EOF`;
  await runCommand(writeParamsCmd, '.', taskId);

  const compileCommand = [
    'npx ts-node',
    '--skip-project',
    '--transpile-only',
    `--compiler-options '{"module":"commonjs","esModuleInterop":true}'`,
    `"${tempRunnerDir}/runner.ts"`,
    `"${tempRunnerDir}/params.json"`
  ].join(' ');
  
  const dockerRunCmd = `docker exec ${containerName} bash -c "cd /usr/src/${rootPath}/app && ${compileCommand}"`;
  const commandResult = await runCommand(dockerRunCmd, '.', taskId);

  await runCommand(`docker exec ${containerName} rm -rf ${tempRunnerDir}`, '.', taskId);

  return commandResult;
}

async function updateContainerInDB(containerName: string, projectId: string) {
  await pool.query(
    'UPDATE solanaproject SET container_name = $1 WHERE id = $2',
    [containerName, projectId]
  );
}

export async function getContainerName(projectId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT container_name FROM solanaproject WHERE id = $1',
    [projectId]
  );
  if (!result.rows.length || !result.rows[0].container_name) {
    return null;
  }
  return result.rows[0].container_name;
}

async function waitForServerReady(containerName: string, maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  console.log(`Waiting for CRA server to be ready in container ${containerName}...`);
  
  const projectIdResult = await pool.query(
    'SELECT id FROM solanaproject WHERE container_name = $1',
    [containerName]
  );
  
  if (!projectIdResult.rows.length) {
    console.log(`Could not find project ID for container ${containerName}`);
    return false;
  }
  
  const projectId = projectIdResult.rows[0].id;
  
  const rootPathResult = await pool.query(
    'SELECT name FROM solanaproject WHERE id = $1',
    [projectId]
  );
  
  let rootPath = '';
  if (rootPathResult.rows.length > 0) {
    rootPath = normalizeProjectName(rootPathResult.rows[0].name);
  } else {
    console.log(`Could not determine project name for project ${projectId}`);
    return false;
  }
  
  try {
    const processCheck = await new Promise<string>((resolve) => {
      exec(`docker exec ${containerName} bash -c "ps aux | grep 'react-scripts start' | grep -v grep"`, 
        (error, stdout) => {
          resolve(stdout.trim());
        });
    });
    
    console.log(`CRA process check: ${processCheck ? "Process found" : "No process found"}`);
    
    if (!processCheck) {
      console.log("CRA dev server process is not running - checking logs for errors:");
      await new Promise<void>((resolve) => {
        exec(`docker exec ${containerName} bash -c "cat /usr/src/${rootPath}/app/cra-startup.log || echo 'No log file'"`, 
          (error, stdout) => {
            console.log("CRA startup log contents:", stdout);
            resolve();
          });
      });
    }
  } catch (error) {
    console.log("Error checking for CRA process:", error);
  }
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const checkCmd = `docker exec ${containerName} bash -c "curl -s http://localhost:3000 -o /dev/null -w '%{http_code}' || curl -s http://0.0.0.0:3000 -o /dev/null -w '%{http_code}'"`;
      const result = await new Promise<string>((resolve, reject) => {
        exec(checkCmd, (error, stdout, stderr) => {
          if (error && !stdout.includes('200')) {
            reject(error);
          } else {
            resolve(stdout.trim());
          }
        });
      });
      
      if (result === '200') {
        console.log(`CRA server is ready in container ${containerName} after ${attempt} attempts`);
        return true;
      }
      console.log(`Attempt ${attempt}/${maxAttempts}: Server not ready yet, status code: ${result}`);
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxAttempts}: Server not responding yet`);
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  console.log(`Server did not become ready after ${maxAttempts} attempts`);
  return false;
}
