import React from 'react';
import { toaster } from '@/components/ui/toaster'; 
import { ProjectContextType } from '@/context/project/ProjectContextTypes';
import { projectApi } from '@/api/projectApi'; 
import { pollTaskStatus3 } from '@/utils/task/taskUtils'; 
import { Buffer } from 'buffer';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  Keypair,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  Cluster,
  SendTransactionError,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  BPF_UPGRADE_LOADER_ID,
  createInitializeBufferData, 
  createDeployInstructionData, 
  createWriteBufferInstructionData,
  createSetAuthorityInstructionData,
} from './instructionData';
import { checkBufferAuthority } from './checkBufferAuth';

export async function deployUpgradeableProgram(
  connection: Connection,
  phantomPublicKey: PublicKey,
  signAndSendTransaction: (tx: Transaction, signers?: Keypair[]) => Promise<string>,
  programData: Buffer,
  deployControlOption: 'fullWallet' | 'delegated' = 'delegated'
): Promise<PublicKey> {
  console.log('calling deployUpgradeableProgram');

  const bufferAccount = Keypair.generate();
  const bufferSpace = 37 + programData.length;
  console.log('bufferSpace', bufferSpace);
  const rentExemptionAmt = await connection.getMinimumBalanceForRentExemption(bufferSpace);
  console.log('rentExemptionAmt', rentExemptionAmt);

  const createBufferIx = SystemProgram.createAccount({
    fromPubkey: phantomPublicKey,
    lamports: rentExemptionAmt,
    newAccountPubkey: bufferAccount.publicKey,
    space: bufferSpace,
    programId: BPF_UPGRADE_LOADER_ID,
  });
  console.log('createBufferIx', createBufferIx);

  const bufferInitIx = new TransactionInstruction({
    programId: BPF_UPGRADE_LOADER_ID,
    keys: [
      { isSigner: false, isWritable: true, pubkey: bufferAccount.publicKey },
      { isSigner: true, isWritable: false, pubkey: phantomPublicKey },
    ],
    data: createInitializeBufferData(),
  });
  console.log('bufferInitIx', bufferInitIx);

  let transaction = new Transaction().add(createBufferIx, bufferInitIx);
  try {
    await signAndSendTransaction(transaction, [bufferAccount]);
    console.log('transaction sent (create & init buffer)');
  } catch (err) {
    if (err instanceof SendTransactionError) {
      console.error('SendTransactionError logs:', err.logs);
    } else {
      console.error('Unknown error:', err);
    }
    throw err;
  }

  console.log('bufferAccount', bufferAccount.publicKey.toBase58());

  let currentBufferAuthority = phantomPublicKey;
  let ephemeralKeypair: Keypair | undefined;

  if (deployControlOption === 'delegated') {
    ephemeralKeypair = Keypair.generate();
    console.log('ephemeralKeypair', ephemeralKeypair.publicKey.toBase58());

    try {
      const airdropSig = await connection.requestAirdrop(
        ephemeralKeypair.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature: airdropSig,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );
      console.log('Airdrop to ephemeral key complete');
      const ephemeralBalance = await connection.getBalance(ephemeralKeypair.publicKey);
      console.log(
        'Ephemeral balance after airdrop:',
        ephemeralBalance / LAMPORTS_PER_SOL,
        'SOL'
      );

    } catch (err) {
      console.log('Airdrop failed, or you might be on mainnet. Ensure ephemeralKeypair is funded.');
    }

    const setAuthorityIx = new TransactionInstruction({
      programId: BPF_UPGRADE_LOADER_ID,
      keys: [
        { pubkey: bufferAccount.publicKey,      isSigner: false, isWritable: true },
        { pubkey: phantomPublicKey,             isSigner: true,  isWritable: false },
        { pubkey: ephemeralKeypair.publicKey,   isSigner: false, isWritable: false },
      ],
      data: createSetAuthorityInstructionData(),
    });

    transaction = new Transaction().add(setAuthorityIx);
    await signAndSendTransaction(transaction);
    console.log('authority transferred to ephemeral key');

    const bufferAuthority = await checkBufferAuthority(connection, bufferAccount.publicKey);
    console.log('Current buffer authority is:', bufferAuthority?.toBase58());
    
    currentBufferAuthority = ephemeralKeypair.publicKey;
  }

  const CHUNK_SIZE = 700;
  let offset = 0;

  while (offset < programData.length) {
    console.log('writing chunk', offset);
    const chunk = programData.slice(offset, offset + CHUNK_SIZE);

    const writeIx = new TransactionInstruction({
      programId: BPF_UPGRADE_LOADER_ID,
      keys: [
        { pubkey: bufferAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: currentBufferAuthority, isSigner: true, isWritable: false },
      ],
      data: createWriteBufferInstructionData(offset, chunk),
    });

    const writeTx = new Transaction().add(writeIx);
    
    try {
      if (deployControlOption === 'delegated' && ephemeralKeypair) {
        writeTx.feePayer = ephemeralKeypair.publicKey;

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        writeTx.recentBlockhash = blockhash;

        writeTx.sign(ephemeralKeypair);

        const txSig = await connection.sendRawTransaction(writeTx.serialize(), {
          skipPreflight: false,
        });

        await connection.confirmTransaction(
          {
            signature: txSig,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed'
        );

        console.log(`Chunk at offset ${offset} written. Tx sig: ${txSig}`);
      } else {
        await signAndSendTransaction(writeTx);
        console.log(`Chunk at offset ${offset} written with wallet.`);
      }
    } catch (err) {
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError logs:', err.logs);
      } else {
        console.error('Unknown error:', err);
      }
      throw err;
    }

    offset += CHUNK_SIZE;
  }

  if (deployControlOption === 'delegated' && ephemeralKeypair) {
    const revertAuthorityIx = new TransactionInstruction({
      programId: BPF_UPGRADE_LOADER_ID,
      keys: [
        { pubkey: bufferAccount.publicKey,      isSigner: false, isWritable: true },
        { pubkey: ephemeralKeypair.publicKey,   isSigner: true,  isWritable: false },
        { pubkey: phantomPublicKey,             isSigner: false, isWritable: false },
      ],
      data: createSetAuthorityInstructionData(),
    });

    transaction = new Transaction().add(revertAuthorityIx);
    await signAndSendTransaction(transaction, [ephemeralKeypair]);
    console.log('authority reverted to phantom');

    const bufferAuthority2 = await checkBufferAuthority(connection, bufferAccount.publicKey);
    console.log('Current buffer authority is:', bufferAuthority2?.toBase58());
  }

  const programKeypair = Keypair.generate(); 
  console.log('programKeypair', programKeypair);

  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [programKeypair.publicKey.toBuffer()],
    BPF_UPGRADE_LOADER_ID
  );

  const finalizeIx = new TransactionInstruction({
    programId: BPF_UPGRADE_LOADER_ID,
    keys: [
      { pubkey: phantomPublicKey,         isSigner: true,  isWritable: true },
      { pubkey: programDataAddress,       isSigner: false, isWritable: true },
      { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: bufferAccount.publicKey,  isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY,       isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK_PUBKEY,      isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
      { pubkey: phantomPublicKey,         isSigner: true,  isWritable: false },
    ],
    data: createDeployInstructionData(bufferSpace),
  });
  console.log('finalizeIx', finalizeIx);

  const neededLamports = await connection.getMinimumBalanceForRentExemption(36);

  transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: phantomPublicKey,
      newAccountPubkey: programKeypair.publicKey,
      lamports: neededLamports,
      space: 36,
      programId: BPF_UPGRADE_LOADER_ID,
    }),
    finalizeIx
  );

  try {
    await signAndSendTransaction(transaction, [programKeypair]);
    console.log('transaction sent (finalize)');
  } catch (err) {
    if (err instanceof SendTransactionError) {
      console.error('SendTransactionError logs:', err.logs);
    } else {
      console.error('Unknown error:', err);
    }
    throw err;
  }

  const deployedPubkey = programKeypair.publicKey;
  console.log('Upgradeable program deployed to:', deployedPubkey.toBase58());
  return deployedPubkey;
}


export const handleDeployProgram = async (
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  walletPublicKey: PublicKey,
  signAndSendTransaction: (tx: Transaction, signers?: Keypair[]) => Promise<string>,
  cluster: Cluster,
  deployControlOption: 'fullWallet' | 'delegated' = 'delegated'
) => {
  if (!projectContext.details?.projectState?.fileTree) console.log('no file tree found');

  // Validate wallet connection first
  if (!walletPublicKey || !(walletPublicKey instanceof PublicKey)) {
    console.error('Wallet connection error: Invalid or undefined wallet public key');
    toaster.create({
      title: 'Wallet not properly connected. Please connect your wallet and try again.',
      type: 'error',
    });
    return;
  }
  
  // Test if wallet is working correctly with a tiny self-transfer
  try {
    const connection = new Connection('https://tiniest-smart-putty.solana-devnet.quiknode.pro/31fdf5493679b4c1c854289d95c822094900efc2/', 'confirmed');
    console.log('Testing wallet connection with simple transaction...');
    
    const testTx = new Transaction();
    testTx.add(SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: walletPublicKey, // Send to self
      lamports: 100, // Minimal amount
    }));
    
    const { blockhash } = await connection.getLatestBlockhash();
    testTx.recentBlockhash = blockhash;
    testTx.feePayer = walletPublicKey;
    
    const testSig = await signAndSendTransaction(testTx);
    console.log('Wallet test transaction succeeded:', testSig.substring(0, 10) + '...');
  } catch (testError: any) {
    console.error('Wallet test transaction failed:', testError);
    toaster.create({
      title: 'Wallet connection issue. Please reconnect your wallet and try again.',
      description: `Error: ${testError.message}`,
      type: 'error',
    });
    return;
  }

  // Verify explicitly that we're connected to devnet with a fresh connection
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('Verifying devnet connection with fresh connection object...');
    
    // Get recent blockhash to verify connection
    const { blockhash } = await connection.getLatestBlockhash();
    console.log('Successfully connected to devnet. Recent blockhash:', blockhash.substring(0, 10) + '...');
    
    // Verify wallet account exists on this network
    const accountInfo = await connection.getAccountInfo(walletPublicKey);
    console.log('Wallet account on devnet:', accountInfo ? 'exists' : 'not found or empty');
    
    if (!accountInfo) {
      console.warn('Wallet account not found on devnet. This might indicate you need an airdrop or are on the wrong network.');
    }
  } catch (networkError: any) {
    console.error('Error connecting to devnet:', networkError);
    toaster.create({
      title: 'Network connection error. Please check your internet connection and try again.',
      description: `Error: ${networkError.message}`,
      type: 'error',
    });
    return;
  }

  try {
    const buildResponse = await projectApi.buildProject(projectContext.id ?? '');
    if (!buildResponse?.taskId) { console.log('no task id returned'); return; }
    console.log('buildResponse', buildResponse);

    toaster.create({
      title: 'Building project. This may take a few minutes...',
      type: 'info',
    });

    const connection = new Connection('https://tiniest-smart-putty.solana-devnet.quiknode.pro/31fdf5493679b4c1c854289d95c822094900efc2/', 'confirmed');
    console.log('connection', connection);

    // Double-check wallet is still connected before proceeding with lengthy build
    if (!walletPublicKey) {
      console.error('Wallet public key became undefined during build preparation');
      toaster.create({
        title: 'Wallet disconnected. Please reconnect and try again.',
        type: 'error',
      });
      return;
    }

    // Verify wallet is on correct network by checking an account that only exists on devnet
    try {
      // Try looking up a devnet-only account or getting recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      console.log(`Connected to correct network. Latest blockhash: ${blockhash}`);
    } catch (networkError: any) {
      console.error('Network connection error - possibly not on devnet:', networkError);
      toaster.create({
        title: 'Network connection error. Please ensure your wallet is set to devnet.',
        type: 'error',
      });
      return;
    }

    let taskData = await pollTaskStatus3(buildResponse.taskId);
    taskData = taskData.task;
    if (
      taskData.status === 'finished' || 
      taskData.status === 'succeed' ||
      taskData.status === 'warning'
    ) {
      console.log('calling getBuildArtifact');
      const buildArtifact = await projectApi.getBuildArtifact(projectContext.id ?? '');
      if (buildArtifact.status === 'success') {
        console.log('buildArtifact', buildArtifact);
        console.log('Length:', buildArtifact.base64So.length);

        const programData = Buffer.from(buildArtifact.base64So, 'base64');
        console.log('programData raw length', programData.length);
        
        let ephemeralPubkey: PublicKey | undefined;
        if (deployControlOption === 'delegated') {
          try {
            // Verify wallet is on the correct network (devnet)
            const walletOnCorrectNetwork = cluster === 'devnet'; // Ideally check with wallet adapter
            if (!walletOnCorrectNetwork) {
              console.warn('Wallet may not be on devnet network. Deployment might fail.');
            }
            
            const ephemeralResp = await projectApi.createEphemeral(projectContext.id ?? '');
            ephemeralPubkey = new PublicKey(ephemeralResp.ephemeralPubkey);
            console.log('Fetched ephemeral pubkey:', ephemeralPubkey.toBase58());

            // Reference the same chunk size used in deployUpgradeableProgram
            const CHUNK_SIZE = 700; // Must match the chunk size used during deployment
            
            // Calculate buffer rent (for the buffer account holding the program)
            const bufferSpace = 37 + programData.length;
            const bufferRentNeeded = await connection.getMinimumBalanceForRentExemption(bufferSpace);
            console.log(`Buffer space: ${bufferSpace} bytes, rent: ${bufferRentNeeded / LAMPORTS_PER_SOL} SOL`);

            // Calculate program data rent (for the upgradeable program data account)
            const programDataRent = await connection.getMinimumBalanceForRentExemption(36);
            console.log(`Program data rent: ${programDataRent / LAMPORTS_PER_SOL} SOL`);

            // Estimate transaction fees based on number of chunks
            const chunkCount = Math.ceil(programData.length / CHUNK_SIZE);
            const feeEstimate = (chunkCount + 2) * 10000; // 10k lamports each (create buffer, chunk writes, finalize)
            console.log(`Estimated ${chunkCount + 2} transactions, fees: ${feeEstimate / LAMPORTS_PER_SOL} SOL`);

            // Add safety margin
            const marginLamports = 0.02 * LAMPORTS_PER_SOL;
            console.log(`Safety margin: ${marginLamports / LAMPORTS_PER_SOL} SOL`);

            // Calculate total lamports needed
            const lamportsToFund = bufferRentNeeded + programDataRent + feeEstimate + marginLamports;
            console.log(`Total funding needed: ${lamportsToFund / LAMPORTS_PER_SOL} SOL`);
            
            // Check if ephemeral already has sufficient funds before attempting to transfer
            const existingEphemeralBalance = await connection.getBalance(ephemeralPubkey);
            console.log(`Existing ephemeral balance: ${existingEphemeralBalance / LAMPORTS_PER_SOL} SOL`);
            
            let fundingSuccessful = false;
            
            // If ephemeral already has enough funds, skip the funding step
            if (existingEphemeralBalance >= lamportsToFund) {
              console.log(`Ephemeral account already has sufficient funds (${existingEphemeralBalance / LAMPORTS_PER_SOL} SOL). Skipping funding step.`);
              fundingSuccessful = true;
            } else {
              const additionalFundsNeeded = lamportsToFund - existingEphemeralBalance;
              console.log(`Ephemeral needs additional ${additionalFundsNeeded / LAMPORTS_PER_SOL} SOL`);
              
              // Verify wallet has enough balance for the additional funds
              const walletBalance = await connection.getBalance(walletPublicKey);
              if (walletBalance < additionalFundsNeeded) {
                throw new Error(`Insufficient balance. Need ${additionalFundsNeeded / LAMPORTS_PER_SOL} SOL but wallet only has ${walletBalance / LAMPORTS_PER_SOL} SOL`);
              }

              try {
                // Create funding transaction for the difference
                const fundIx = SystemProgram.transfer({
                  fromPubkey: walletPublicKey,
                  toPubkey: ephemeralPubkey,
                  lamports: additionalFundsNeeded,
                });
                const fundTx = new Transaction().add(fundIx);

                // Add recent blockhash to transaction before signing
                const { blockhash } = await connection.getLatestBlockhash();
                fundTx.recentBlockhash = blockhash;
                fundTx.feePayer = walletPublicKey;
                
                // Double-check wallet is still connected
                if (!walletPublicKey) {
                  throw new Error('Wallet disconnected during transaction preparation');
                }

                // Detailed transaction structure verification to detect improper usage of ephemeral key
                console.log('TRANSACTION VERIFICATION:', {
                  fromPubkey: fundIx.keys[0].pubkey.toBase58(),
                  fromIsPhantomWallet: fundIx.keys[0].pubkey.equals(walletPublicKey),
                  toPubkey: fundIx.keys[1].pubkey.toBase58(),
                  toIsEphemeral: ephemeralPubkey ? fundIx.keys[1].pubkey.equals(ephemeralPubkey as PublicKey) : false,
                  feePayer: fundTx.feePayer?.toBase58(),
                  feePayerIsPhantomWallet: fundTx.feePayer ? fundTx.feePayer.equals(walletPublicKey) : false,
                  signers: fundTx.signatures.map(s => s.publicKey.toBase58()),
                  signersIncludeEphemeral: ephemeralPubkey ? fundTx.signatures.some(s => 
                    s.publicKey.equals(ephemeralPubkey as PublicKey)
                  ) : false
                });
                
                // Double-check no ephemeral key appears in signers array
                if (ephemeralPubkey && fundTx.signatures.some(s => 
                    s.publicKey.equals(ephemeralPubkey as PublicKey)
                )) {
                  console.error('ERROR: Ephemeral key found in transaction signers array!');
                  throw new Error('Transaction incorrectly structured - ephemeral key cannot be a signer');
                }

                // Send and confirm the funding transaction
                console.log('Requesting wallet to sign funding transaction...');
                let signature;
                try {
                  signature = await signAndSendTransaction(fundTx);
                  console.log(`Signature received: ${signature}`);
                } catch (signError: any) {
                  console.error('Error during signAndSendTransaction:', signError);
                  
                  // Unwrap nested errors if possible
                  const errorMessage = signError.message || 'Unknown error during transaction signing';
                  const errorCode = signError.code || '';
                  
                  // Check for wallet connection/signature issues
                  if (errorMessage.includes('Invalid public key')) {
                    console.error('INVALID PUBLIC KEY DETAILED DEBUG:', {
                      errorMessage,
                      errorCode,
                      // Recheck transaction details at error time
                      walletPublicKey: walletPublicKey?.toBase58() || 'undefined',
                      feePayer: fundTx.feePayer?.toBase58() || 'undefined',
                      feePayerIsWallet: fundTx.feePayer?.equals(walletPublicKey) || false,
                      fromPubkey: fundTx.instructions[0]?.keys?.[0]?.pubkey?.toBase58() || 'undefined',
                      fromPubkeyIsWallet: fundTx.instructions[0]?.keys?.[0]?.pubkey?.equals(walletPublicKey) || false,
                      allSigners: fundTx.signatures.map(s => s.publicKey.toBase58()),
                      // Add wallet adapter connection check
                      isOnDevnet: cluster === 'devnet',
                    });
                    
                    throw new Error(`Wallet connection issue: ${errorMessage}. Please disconnect and reconnect your wallet.`);
                  }
                  
                  if (errorMessage.includes('User rejected') || 
                      errorMessage.includes('cancelled') ||
                      errorMessage.includes('denied') ||
                      errorCode === 4001) {
                    throw new Error(`User rejected the transaction: ${errorMessage}`);
                  }
                  
                  // Re-throw with better context
                  throw new Error(`Transaction signing failed: ${errorMessage}`);
                }
                
                if (!signature) {
                  throw new Error('No signature returned from wallet');
                }
                
                console.log(`Ephemeral funding transaction sent for ${additionalFundsNeeded / LAMPORTS_PER_SOL} SOL. Sig:`, signature);

                // Get fresh blockhash for confirmation
                const latestBlockhash = await connection.getLatestBlockhash();
                
                // Confirm the transaction with timeout and retry
                console.log('Confirming transaction...');
                try {
                  await connection.confirmTransaction({
                    signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                  }, 'confirmed');
                  console.log(`Transaction confirmed. Ephemeral successfully funded with additional ${additionalFundsNeeded / LAMPORTS_PER_SOL} SOL`);
                } catch (confirmError: any) {
                  console.error('Transaction confirmation error:', confirmError);
                  
                  // Check if transaction actually went through despite confirmation error
                  const txStatus = await connection.getSignatureStatus(signature);
                  console.log('Transaction status:', txStatus);
                  
                  if (txStatus.value?.confirmationStatus === 'confirmed' || 
                      txStatus.value?.confirmationStatus === 'finalized') {
                    console.log('Transaction actually confirmed despite error');
                  } else {
                    throw new Error(`Transaction confirmation failed: ${confirmError.message}`);
                  }
                }

                // Verify ephemeral account received funds
                const updatedEphemeralBalance = await connection.getBalance(ephemeralPubkey);
                console.log(`Verified ephemeral balance: ${updatedEphemeralBalance / LAMPORTS_PER_SOL} SOL`);
                
                if (updatedEphemeralBalance < lamportsToFund * 0.95) { // Allow 5% tolerance
                  console.warn(`Ephemeral account only has ${updatedEphemeralBalance / LAMPORTS_PER_SOL} SOL, less than expected ${lamportsToFund / LAMPORTS_PER_SOL} SOL`);
                  throw new Error(`Ephemeral account funding insufficient. Required: ${lamportsToFund / LAMPORTS_PER_SOL} SOL, Available: ${updatedEphemeralBalance / LAMPORTS_PER_SOL} SOL`);
                }
                
                fundingSuccessful = true;
                
                // CRITICAL: Reset any transaction-related variables before server-side deployment
                // This ensures clean separation between wallet operations and server-side operations
                console.log('Client-side funding complete. Transaction phase completed, proceeding to server-side deployment.');
                
                // No assignments to constants - just make sure we're done with wallet operations

                // Explicitly check wallet one more time before proceeding
                if (!walletPublicKey) {
                  throw new Error('Wallet disconnected before deployment could start');
                }

                // Start server-side ephemeral deployment
                console.log('Starting server-side ephemeral deployment with key:', ephemeralResp.ephemeralPubkey);
                
                // Before starting server-side deployment, make sure we're completely done with wallet operations
                // This ensures there's no race condition where wallet might be used with ephemeral key
                try {
                  const deployResp = await projectApi.deployProjectEphemeral(
                    projectContext.id ?? '', 
                    ephemeralResp.ephemeralPubkey
                  );
                  console.log('Backend ephemeral deploy task started. TaskId:', deployResp.taskId);
                  
                  toaster.create({
                    title: 'Deploying program with ephemeral key...',
                    type: 'info',
                  });
                  
                  const deployTaskData = await pollTaskStatus3(deployResp.taskId);
                  console.log('Deploy task completed. Full response:', deployTaskData);
                  console.log('Task status:', deployTaskData.task.status);
                  console.log('Task result (raw):', deployTaskData.task.result);
                  console.log('Task result type:', typeof deployTaskData.task.result);
                  
                  if (deployTaskData.task.status === 'succeed') {
                    // Before trying to create PublicKey, validate the result
                    const rawResult = deployTaskData.task.result;
                    
                    if (!rawResult) {
                      console.error('Task succeeded but returned empty result');
                      toaster.create({
                        title: 'Deployment returned empty result',
                        type: 'error',
                      });
                      return;
                    }
                    
                    // First try to parse as JSON, as that's the new format
                    let programId: string | null = null;
                    try {
                      // Check if result is a JSON string
                      const parsedResult = JSON.parse(rawResult);
                      console.log('Parsed result:', parsedResult);
                      
                      if (parsedResult.status === 'success' && parsedResult.programId) {
                        programId = parsedResult.programId;
                        console.log('Extracted program ID from JSON:', programId);
                      } else if (parsedResult.status === 'failed') {
                        console.error('Deployment failed with error:', parsedResult.error);
                        toaster.create({
                          title: 'Deployment failed',
                          description: parsedResult.error,
                          type: 'error',
                        });
                        return;
                      }
                    } catch (jsonError) {
                      // If not JSON, assume it's the raw program ID (for backwards compatibility)
                      console.log('Result is not JSON, using as raw program ID');
                      programId = rawResult.trim();
                    }
                    
                    // Check that it matches expected base58 format
                    if (!programId) {
                      console.error('Failed to extract program ID from result');
                      toaster.create({
                        title: 'Failed to extract program ID from result',
                        type: 'error',
                      });
                      return;
                    }
                    
                    const cleanedProgramId = programId.trim();
                    console.log('Program ID after trimming:', cleanedProgramId);
                    
                    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanedProgramId)) {
                      console.error('Invalid program ID format:', cleanedProgramId);
                      toaster.create({
                        title: 'Invalid program ID format returned',
                        description: `Raw value: ${cleanedProgramId}`,
                        type: 'error',
                      });
                      return;
                    }
                    
                    try {
                      const deployedProgramId = new PublicKey(cleanedProgramId);
                      console.log('Program deployed successfully with ID:', deployedProgramId.toBase58());
                      
                      // Show success message with program ID to the user
                      toaster.create({
                        title: 'Deployment successful',
                        description: `Program ID: ${deployedProgramId.toBase58()}`,
                        type: 'success',
                      });
                      
                      // Store the program ID in project context
                      setProjectContext(prev => ({
                        ...prev,
                        details: prev.details ? {
                          ...prev.details,
                          deployedProgramId: deployedProgramId.toBase58(),
                        } : prev.details
                      }));
                      
                      return deployedProgramId;
                    } catch (pubkeyError) {
                      console.error('Error creating PublicKey from result:', pubkeyError);
                      console.error('Raw program ID that caused the error:', JSON.stringify(cleanedProgramId));
                      toaster.create({
                        title: 'Error parsing program ID',
                        description: `${pubkeyError}`,
                        type: 'error',
                      });
                      return;
                    }
                  } else {
                    console.error('Deployment failed:', deployTaskData.task.result);
                    
                    // Try to parse the error message from JSON
                    try {
                      const parsedError = JSON.parse(deployTaskData.task.result);
                      if (parsedError.status === 'failed' && parsedError.error) {
                        toaster.create({
                          title: 'Deployment failed',
                          description: parsedError.error,
                          type: 'error',
                        });
                        return;
                      }
                    } catch (jsonError) {
                      // If not JSON, show raw error
                      toaster.create({
                        title: 'Deployment failed. Check terminal logs for details.',
                        description: deployTaskData.task.result || 'Unknown error',
                        type: 'error',
                      });
                    }
                    
                    return;
                  }
                } catch (deployErr: any) {
                  console.error('Error during server-side deployment:', deployErr);
                  toaster.create({
                    title: `Deployment error: ${deployErr.message}`,
                    type: 'error',
                  });
                  return;
                }
              } catch (fundingError: any) {
                console.error('Funding transaction failed:', fundingError);
                
                // Specific handling for user rejection
                if (fundingError.message?.includes('User rejected') || 
                    fundingError.message?.includes('cancelled') || 
                    fundingError.message?.includes('denied')) {
                  throw new Error(`User rejected the funding transaction: ${fundingError.message}`);
                }
                
                // Handle invalid public key errors
                if (fundingError.message?.includes('Invalid public key input')) {
                  throw new Error(`Wallet connection error: ${fundingError.message}. Please reconnect your wallet and ensure it's on devnet.`);
                }
                
                // Re-throw the original error if not specifically handled
                throw fundingError;
              }
            }
            
            // Only proceed with deployment if funding was successful
            if (!fundingSuccessful) {
              throw new Error('Ephemeral account funding failed');
            }
            
            // Check one more time to ensure wallet is still connected 
            // before starting server-side deployment
            if (!walletPublicKey) {
              throw new Error('Wallet disconnected before deployment could start');
            }
            
            // Start server-side ephemeral deployment
            console.log('Starting server-side ephemeral deployment with key:', ephemeralResp.ephemeralPubkey);
            const deployResp = await projectApi.deployProjectEphemeral(
              projectContext.id ?? '', 
              ephemeralResp.ephemeralPubkey
            );
            console.log('Backend ephemeral deploy task started. TaskId:', deployResp.taskId);
            
            toaster.create({
              title: 'Deploying program with ephemeral key...',
              type: 'info',
            });
            
            const deployTaskData = await pollTaskStatus3(deployResp.taskId);
            console.log('Deploy task completed. Full response:', deployTaskData);
            console.log('Task status:', deployTaskData.task.status);
            console.log('Task result (raw):', deployTaskData.task.result);
            console.log('Task result type:', typeof deployTaskData.task.result);
            
            if (deployTaskData.task.status === 'succeed') {
              // Before trying to create PublicKey, validate the result
              const rawResult = deployTaskData.task.result;
              
              if (!rawResult) {
                console.error('Task succeeded but returned empty result');
                toaster.create({
                  title: 'Deployment returned empty result',
                  type: 'error',
                });
                return;
              }
              
              // First try to parse as JSON, as that's the new format
              let programId: string | null = null;
              try {
                // Check if result is a JSON string
                const parsedResult = JSON.parse(rawResult);
                console.log('Parsed result:', parsedResult);
                
                if (parsedResult.status === 'success' && parsedResult.programId) {
                  programId = parsedResult.programId;
                  console.log('Extracted program ID from JSON:', programId);
                } else if (parsedResult.status === 'failed') {
                  console.error('Deployment failed with error:', parsedResult.error);
                  toaster.create({
                    title: 'Deployment failed',
                    description: parsedResult.error,
                    type: 'error',
                  });
                  return;
                }
              } catch (jsonError) {
                // If not JSON, assume it's the raw program ID (for backwards compatibility)
                console.log('Result is not JSON, using as raw program ID');
                programId = rawResult.trim();
              }
              
              // Check that it matches expected base58 format
              if (!programId) {
                console.error('Failed to extract program ID from result');
                toaster.create({
                  title: 'Failed to extract program ID from result',
                  type: 'error',
                });
                return;
              }
              
              const cleanedProgramId = programId.trim();
              console.log('Program ID after trimming:', cleanedProgramId);
              
              /*
              if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanedProgramId)) {
                console.error('Invalid program ID format:', cleanedProgramId);
                toaster.create({
                  title: 'Invalid program ID format returned',
                  description: `Raw value: ${cleanedProgramId}`,
                  type: 'error',
                });
                return;
              }
                */
              
              try {
                const deployedProgramId = new PublicKey(cleanedProgramId);
                console.log('Program deployed successfully with ID:', deployedProgramId.toBase58());
                
                // Show success message with program ID to the user
                toaster.create({
                  title: 'Deployment successful',
                  description: `Program ID: ${deployedProgramId.toBase58()}`,
                  type: 'success',
                });
                
                // Store the program ID in project context
                setProjectContext(prev => ({
                  ...prev,
                  details: prev.details ? {
                    ...prev.details,
                    deployedProgramId: deployedProgramId.toBase58(),
                  } : prev.details
                }));
                
                return deployedProgramId;
              } catch (pubkeyError) {
                console.error('Error creating PublicKey from result:', pubkeyError);
                console.error('Raw program ID that caused the error:', JSON.stringify(cleanedProgramId));
                toaster.create({
                  title: 'Error parsing program ID',
                  description: `${pubkeyError}`,
                  type: 'error',
                });
                return;
              }
            } else {
              console.error('Deployment failed:', deployTaskData.task.result);
              
              // Try to parse the error message from JSON
              try {
                const parsedError = JSON.parse(deployTaskData.task.result);
                if (parsedError.status === 'failed' && parsedError.error) {
                  toaster.create({
                    title: 'Deployment failed',
                    description: parsedError.error,
                    type: 'error',
                  });
                  return;
                }
              } catch (jsonError) {
                // If not JSON, show raw error
                toaster.create({
                  title: 'Deployment failed. Check terminal logs for details.',
                  description: deployTaskData.task.result || 'Unknown error',
                  type: 'error',
                });
              }
              
              return;
            }
          } catch (err: any) {
            // Provide more specific error message based on error type
            if (err.message?.includes('Invalid public key input')) {
              console.error('Wallet connection error:', err);
              toaster.create({ 
                title: 'Wallet connection issue. Please reconnect your wallet and ensure it\'s on devnet.', 
                type: 'error' 
              });
            } else if (err.message?.includes('User rejected')) {
              console.error('User rejected transaction:', err);
              toaster.create({ 
                title: 'Transaction rejected. Please approve the transaction to fund the deployment.', 
                type: 'error' 
              });
            } else if (err.message?.includes('Insufficient balance')) {
              console.error('Insufficient wallet balance:', err);
              toaster.create({ 
                title: err.message, 
                type: 'error' 
              });
            } else {
              console.error('Error funding ephemeral or deploying:', err);
              toaster.create({ 
                title: 'Funding ephemeral key or deployment failed. See logs for details.', 
                type: 'error' 
              });
            }
            return;
          }
        } else {
          const programKey = await deployUpgradeableProgram(
            connection,
            walletPublicKey,
            signAndSendTransaction,
            programData,
            deployControlOption
          );
          console.log('program deployed to:', programKey.toBase58());
          return programKey;
        }
      } else {
        console.log('build artifact retrieval failed');
        toaster.create({
          title: 'Check terminal logs for details.',
          type: 'error',
        });
      }
    } else if (taskData.status === 'failed') {
      console.log('build failed');
      toaster.create({
        title: 'Build failed. Check terminal logs for details.',
        type: 'error',
      });
    }
  } catch (err: any) {
    console.error('Build/deploy error:', err);
    toaster.create({
      title: `Error during project build: ${err?.message ?? err}`,
      type: 'error',
    });
  }
};
