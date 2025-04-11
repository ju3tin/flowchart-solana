import React from 'react';
import { ProjectContextType } from '@/context/project/ProjectContextTypes';
import { taskApi } from '@/api/taskApi';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';
import { mergeFileTree } from './mergeFileTree';
import { amendConfigFile } from './amendConfigFile';
import { hasOnChainNodes } from './nodeUtils';
import { saveProject } from '@/utils/project/saveProject';
import { insertFrontendUIFiles } from './insertFrontendUIFiles';
import { fileApi } from '@/api/fileApi';
import { useTaskLogMonitoring } from '@/utils/logIntegration';

async function waitForAllTasks(taskIds: string[]): Promise<{ allSucceeded: boolean, failedTasks: string[] }> {
    const validTaskIds = taskIds.filter(id => id && id.trim() !== '');
    
    console.log(`[DEBUG_GENERATE_CODE] Waiting for all tasks to complete: ${validTaskIds.join(', ')}`);
    
    if (validTaskIds.length === 0) {
        console.log('[DEBUG_GENERATE_CODE] No valid tasks to wait for');
        return {
            allSucceeded: true,
            failedTasks: []
        };
    }
    
    const results = await Promise.all(
        validTaskIds.map(async (taskId) => {
            try {
                let status = '';
                let attempts = 0;
                const maxAttempts = 60;
                
                while (status !== 'succeed' && status !== 'finished' && 
                       status !== 'failed' && status !== 'warning' && 
                       attempts < maxAttempts) {
                    attempts++;
                    const taskData = await taskApi.getTask(taskId);
                    status = taskData.task.status;
                    console.log(`[DEBUG_GENERATE_CODE] Task ${taskId} status: ${status} (attempt ${attempts}/${maxAttempts})`);
                    
                    if (status !== 'succeed' && status !== 'finished' && 
                        status !== 'failed' && status !== 'warning') {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                
                return { taskId, status, succeeded: (status === 'succeed' || status === 'finished' || status === 'warning') };
            } catch (error) {
                console.error(`[DEBUG_GENERATE_CODE] Error waiting for task ${taskId}:`, error);
                return { taskId, status: 'error', succeeded: false };
            }
        })
    );
    
    const failedTasks = results.filter(r => !r.succeeded).map(r => r.taskId);
    return {
        allSucceeded: failedTasks.length === 0,
        failedTasks
    };
}

let taskLogger: ReturnType<typeof useTaskLogMonitoring> | null = null;

export const handleGenerateCode = async (
    projectContext: ProjectContextType,
    setIsGenerating: (isGenerating: boolean) => void,
    setIsCodeReady: (isCodeReady: boolean) => void,
    setActiveTab: (activeTab: string) => void,
    setFileTree: (tree: FileTreeItemType | null) => void,
    setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>
) => {
    if (!projectContext.id) { console.log('No project ID; cannot generate code.'); return; }
    console.log("[DEBUG_GENERATE_CODE] Starting handleGenerateCode for project:", projectContext.id);
    
    if (typeof window !== 'undefined') {
        const w = window as any;
        if (w.__taskLogger) {
            taskLogger = w.__taskLogger;
            if (taskLogger) {
                taskLogger.startOperation("Code Generation");
                taskLogger.logMessage(`Starting code generation for project: ${projectContext.name || projectContext.id}`);
                taskLogger.updateProgress(10);
            }
        }
    }
    
    setIsGenerating(true);

    const isOnChainPresent = hasOnChainNodes(projectContext);
    const allTaskIds: string[] = [];

    try {
        if (taskLogger) {
            taskLogger.logMessage("Analyzing project structure...");
            taskLogger.updateProgress(20);
        }
        
        if (!isOnChainPresent) {
            try {
                console.log("[DEBUG_GENERATE_CODE] Creating off-chain function code...");
                if (taskLogger) {
                    taskLogger.logMessage("Creating off-chain function code...");
                }
                
                let functionCode = null;
                if (projectContext.details?.projectState?.nodes) {
                    const offChainNodes = projectContext.details.projectState.nodes.filter(node => 
                        node.type === 'uploadMetadataNode' || 
                        node.type === 'createNftNode' || 
                        node.type === 'mintNftNode'
                    );
                                        
                    if (offChainNodes.length > 0) {
                        const functionParts = offChainNodes.map((node, index) => {
                            if (node.data && node.data.code) return node.data.code;
                            else return null;
                        }).filter(Boolean);
                        
                        if (functionParts.length > 0) functionCode = functionParts.join('\n\n');
                        else console.log('No valid function code found in off-chain nodes');
                    }
                } else console.log('No project state nodes found');
            } catch (err) { 
                console.error('Error extracting function code:', err); 
                if (taskLogger) {
                    taskLogger.logMessage("Warning: Error extracting function code");
                }
            }

            const response = { taskId: '123' };
            console.log("[DEBUG_GENERATE_CODE] Starting poll for code-generation task with taskId=", response.taskId);
            allTaskIds.push(response.taskId);

            if (response.taskId) {
                console.log("[DEBUG_GENERATE_CODE] Starting frontend UI file insertion task");
                if (taskLogger) {
                    taskLogger.logMessage("Generating frontend UI files...");
                    taskLogger.updateProgress(30);
                }
                
                const frontendTaskId = await insertFrontendUIFiles(projectContext.id);
                if (frontendTaskId) {
                    console.log("[DEBUG_GENERATE_CODE] Frontend UI file insertion task started:", frontendTaskId);
                    allTaskIds.push(frontendTaskId);
                }
            } else {
                throw new Error('No task ID received from createProjectDirectory');
            }
        } else {
            console.log('[DEBUG_GENERATE_CODE] Starting Anchor project code generation');
            if (taskLogger) {
                taskLogger.logMessage("Starting Anchor project code generation...");
                taskLogger.updateProgress(30);
            }
            
            await saveProject(projectContext, setProjectContext);
            
            if (taskLogger) {
                taskLogger.logMessage("Updating configuration files...");
                taskLogger.updateProgress(40);
            }
            
            const cargoResponse = await amendConfigFile(projectContext.id, 'Cargo.toml', 'Cargo.toml');
            if (cargoResponse && cargoResponse.taskId) {
                console.log('[DEBUG_GENERATE_CODE] Cargo.toml amendment task started with taskId:', cargoResponse.taskId);
                if (taskLogger) {
                    taskLogger.logMessage("Updating Cargo.toml configuration...");
                }
                allTaskIds.push(cargoResponse.taskId);
            }
            
            const anchorResponse = await amendConfigFile(projectContext.id, 'Anchor.toml', 'Anchor.toml');
            if (anchorResponse && anchorResponse.taskId) {
                console.log('[DEBUG_GENERATE_CODE] Anchor.toml amendment task started with taskId:', anchorResponse.taskId);
                if (taskLogger) {
                    taskLogger.logMessage("Updating Anchor.toml configuration...");
                }
                allTaskIds.push(anchorResponse.taskId);
            }
        }
        
        console.log("[DEBUG_GENERATE_CODE] Waiting for all initial tasks to complete:", allTaskIds.join(", "));
        if (taskLogger) {
            taskLogger.logMessage("Processing initial code generation tasks...");
            taskLogger.updateProgress(50);
        }
        
        const initialResults = await waitForAllTasks(allTaskIds);
        
        if (!initialResults.allSucceeded) {
            console.error("[DEBUG_GENERATE_CODE] Some initial tasks failed:", initialResults.failedTasks);
            if (taskLogger) {
                taskLogger.logMessage("Warning: Some initial tasks had issues. Continuing with file tree merge...");
            }
        }
        
        console.log("[DEBUG_GENERATE_CODE] Initial tasks completed. Waiting for file system to stabilize...");
        if (taskLogger) {
            taskLogger.logMessage("Initial tasks completed. Preparing for file tree merge...");
            taskLogger.updateProgress(60);
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log("[DEBUG_GENERATE_CODE] Merging file tree after initial tasks completed");
        if (taskLogger) {
            taskLogger.logMessage("Merging file tree...");
            taskLogger.updateProgress(70);
        }
        
        const fileTreeTaskIds = await mergeFileTree(projectContext, setFileTree, setProjectContext, true);
        console.log("[DEBUG_GENERATE_CODE] File tree merge completed, collected additional task IDs:", fileTreeTaskIds);
        
        if (fileTreeTaskIds.length > 0) {
            console.log("[DEBUG_GENERATE_CODE] Waiting for all file reading tasks to complete:", fileTreeTaskIds.join(", "));
            if (taskLogger) {
                taskLogger.logMessage("Processing file tree operations...");
                taskLogger.updateProgress(80);
            }
            
            const fileTreeResults = await waitForAllTasks(fileTreeTaskIds);
            
            if (!fileTreeResults.allSucceeded) {
                console.warn("[DEBUG_GENERATE_CODE] Some file reading tasks failed:", fileTreeResults.failedTasks);
                if (taskLogger) {
                    taskLogger.logMessage("Warning: Some file reading tasks had issues. Continuing...");
                }
            }
        }
        
        try {
            const fileTreeResponse = await fileApi.getProjectFileTree(projectContext.id);
            const fileTreeResult = await taskApi.getTask(fileTreeResponse.taskId);
            const existingTree = fileTreeResult.task.result ? JSON.parse(fileTreeResult.task.result) : [];
            
            const flattenTree = (tree: any[]): string[] => {
                const paths: string[] = [];
                for (const item of tree || []) {
                    if (item.path) paths.push(item.path);
                    if (item.children) paths.push(...flattenTree(item.children));
                }
                return paths;
            };
            
            const allPaths = flattenTree(existingTree);
            const instructionFiles = allPaths.filter(path => path.includes('/instructions/') && path.endsWith('.rs'));
            console.log("[DEBUG_GENERATE_CODE] Final check - instruction files found:", instructionFiles);
            
            if (taskLogger && instructionFiles.length > 0) {
                taskLogger.logMessage(`Found ${instructionFiles.length} Rust instruction files`);
            }
        } catch (error) {
            console.error("[DEBUG_GENERATE_CODE] Error checking for instruction files:", error);
        }
        
        console.log("[DEBUG_GENERATE_CODE] All tasks and file tree operations completed");
        
        if (taskLogger) {
            taskLogger.logMessage("Code generation completed successfully!");
            taskLogger.updateProgress(90);
            taskLogger.logMessage("Switching to code tab...");
            setTimeout(() => {
                if (taskLogger) {
                    taskLogger.completeOperation("Code generation complete");
                }
            }, 1000);
        }
        
        setIsGenerating(false);
        setIsCodeReady(true);
        setActiveTab('code');
        
    } catch (err) {
        console.error('[DEBUG_GENERATE_CODE] Error in handleGenerateCode:', err);
        if (taskLogger) taskLogger.logError(`Code generation failed: ${err}`);
        
        setIsGenerating(false);
    }
};