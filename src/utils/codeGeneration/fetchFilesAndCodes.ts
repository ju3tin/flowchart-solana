import React from "react";
import { fileApi } from "@/api/fileApi";
import { buildSingleRootNode } from "../files/fileUtils";
import { pollTaskStatus, pollTaskStatus2 } from "../task/taskUtils";
import { populateFileContent } from "./populateFileContent";
import { ProjectContextType, ProjectStateUpdater } from "@/context/project/ProjectContextTypes";
import { FileTreeItemType } from "@/interfaces/FileTreeItemType";
import { saveProject } from "@/utils/project/saveProject";

export const fetchFilesAndCodes = async (
  projectId: string,
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  setFileTree: (fileTree: FileTreeItemType | null) => void,
  afterCodeGen: boolean,
): Promise<{ fileContentTaskIds: string[] }> => {
  const allFileContentTaskIds: string[] = [];
  
  try {
    console.log('[DEBUG_FETCH_FILES] Starting fetchFilesAndCodes for project:', projectId);
    console.log('[DEBUG_FETCH_FILES] afterCodeGen flag:', afterCodeGen);
    
    // fetch the file tree
    const response2 = await fileApi.getProjectFileTree(projectId);
    console.log('[DEBUG_FETCH_FILES] File tree fetch response with taskId:', response2.taskId);
    
    // track this task ID as well
    allFileContentTaskIds.push(response2.taskId);

    // poll for task completion
    const updatedTree = await pollTaskStatus(response2.taskId);
    console.log('[DEBUG_FETCH_FILES] File tree task completed, tree retrieved');

    // populate each file's content
    let fileContentTaskIds: string[] = [];
    if (Array.isArray(updatedTree)) {
      console.log('[DEBUG_FETCH_FILES] Populating content for array tree');
      fileContentTaskIds = await populateFileContent(updatedTree, projectId);
    } else if (updatedTree && updatedTree.children) {
      console.log('[DEBUG_FETCH_FILES] Populating content for tree with children');
      fileContentTaskIds = await populateFileContent(updatedTree.children, projectId);
    }
    
    // add all file content task IDs to our collection
    allFileContentTaskIds.push(...fileContentTaskIds);
    console.log(`[DEBUG_FETCH_FILES] Collected ${fileContentTaskIds.length} file content task IDs`);

    // Wait for all file content tasks to complete
    console.log('[DEBUG_FETCH_FILES] Waiting for all file content tasks to complete...');
    try {
      // Wait for all content tasks to complete, but with a time limit
      const contentTaskPromises = fileContentTaskIds.map(taskId => {
        // Create a timeout promise that rejects after 30 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout waiting for task ${taskId}`)), 30000);
        });
        
        // Create the polling promise
        const pollPromise = pollTaskStatus2(taskId).catch(error => {
          console.warn(`[DEBUG_FETCH_FILES] Error polling task ${taskId}:`, error);
          return null; // Return null to avoid breaking the Promise.all
        });
        
        // Race between timeout and polling
        return Promise.race([pollPromise, timeoutPromise]);
      });
      
      await Promise.allSettled(contentTaskPromises);
      console.log('[DEBUG_FETCH_FILES] All file content tasks have completed or timed out');
    } catch (error) {
      console.warn('[DEBUG_FETCH_FILES] Error waiting for file content tasks:', error);
    }

    // build a single root node
    const singleRoot = buildSingleRootNode(updatedTree, projectContext.name || "Project");
    console.log("[DEBUG_FETCH_FILES] Built single root node");

    // if we have a single root, set it in fileContext
    if (singleRoot) {
      setFileTree(singleRoot);
      
      // Update project context with the file tree
      setProjectContext((prevContext: ProjectContextType) => {
        // Ensure mode is never undefined to satisfy the type check
        const currentMode = prevContext.details?.projectState?.mode || "basic";
        
        // Ensure we preserve the existing setProjectState function
        const setProjectStateFn = prevContext.details?.setProjectState || 
          ((stateUpdater: ProjectStateUpdater) => {
            console.warn("[DEBUG_FETCH_FILES] Using fallback setProjectState function");
          });
        
        const updatedContext: ProjectContextType = {
          ...prevContext,
          id: prevContext.id,
          name: prevContext.name,
          description: prevContext.description,
          containerUrl: prevContext.containerUrl,
          injectingNodeTypes: prevContext.injectingNodeTypes,
          details: {
            setProjectState: setProjectStateFn,
            projectState: {
              mode: currentMode as "basic" | "advanced",
              nodes: prevContext.details?.projectState?.nodes || [],
              edges: prevContext.details?.projectState?.edges || [],
              config: prevContext.details?.projectState?.config || {},
              fileTree: singleRoot,
              programId: prevContext.details?.projectState?.programId,
              instructions: prevContext.details?.projectState?.instructions,
              projectFiles: prevContext.details?.projectState?.projectFiles,
              deployed: prevContext.details?.projectState?.deployed
            }
          }
        };
      
        // Only save the project if this is after actual code generation (not just file loading)
        // and if we're doing code generation explicitly (not just loading a project)
        if (afterCodeGen && projectContext.id) {
          console.log('[DEBUG_FETCH_FILES] This is after code generation, saving project context');
          saveProject(updatedContext, setProjectContext);
        } else {
          console.log('[DEBUG_FETCH_FILES] Not saving project context (afterCodeGen=false or no projectId)');
        }
      
        return updatedContext;
      });
      
      console.log("[DEBUG_FETCH_FILES] File tree updated in context");
    }
  } catch (err) {
    console.error("[DEBUG_FETCH_FILES] Error fetching files and codes:", err);
  }
  
  console.log(`[DEBUG_FETCH_FILES] Returning ${allFileContentTaskIds.length} file content task IDs`);
  return { fileContentTaskIds: allFileContentTaskIds };
};
