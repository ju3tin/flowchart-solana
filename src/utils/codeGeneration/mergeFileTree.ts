import React from "react";
import { fileApi } from "@/api/fileApi";
import { insertSrcFiles } from "./insertSrcFiles";
import { genSrcFiles } from "./genSrcFiles";
import { ProjectContextType } from "@/context/project/ProjectContextTypes";
import { FileTreeItemType } from "@/interfaces/FileTreeItemType";
import { gatherPathsFromTree } from "../files/fileUtils";
import { pollTaskStatus } from "../task/taskUtils";
import { findProgramsSubdirectory } from './findProgramsDirectory';
import { fetchFilesAndCodes } from "./fetchFilesAndCodes";
import { amendConfigFile } from "./amendConfigFile";

export async function mergeFileTree(
    projectContext: ProjectContextType,
    setFileTree: (tree: FileTreeItemType | null) => void,
    setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
    isExplicitCodeGeneration: boolean = true
): Promise<string[]> {
    const allTaskIds: string[] = [];
    
    try {
        const id = projectContext.id;   
        if (!id) return allTaskIds;

        console.log('[DEBUG_MERGE_FILE_TREE] Starting for project:', id);
        console.log('[DEBUG_MERGE_FILE_TREE] isExplicitCodeGeneration:', isExplicitCodeGeneration);

        const response1 = await fileApi.getProjectFileTree(id);
        console.log('[DEBUG_MERGE_FILE_TREE] Received file tree response, taskId=', response1.taskId);
        allTaskIds.push(response1.taskId);
        
        const existingTree = await pollTaskStatus(response1.taskId);
        console.log('[DEBUG_MERGE_FILE_TREE] Fetched existing tree with length=', existingTree?.length || 0);
        
        const flattenTree = (tree: any[]): string[] => {
            const paths: string[] = [];
            for (const item of tree || []) {
                if (item.path) paths.push(item.path);
                if (item.children) paths.push(...flattenTree(item.children));
            }
            return paths;
        };

        const allPaths = flattenTree(existingTree || []);
        const instructionFiles = allPaths.filter(path => path.includes('/instructions/') && path.endsWith('.rs'));
        console.log('[DEBUG_MERGE_FILE_TREE] Instruction files found in tree:', instructionFiles);

        const existingFilePaths = gatherPathsFromTree(existingTree || []);

        const subDirPath = findProgramsSubdirectory(existingTree || []);
        console.log('[DEBUG_MERGE_FILE_TREE] subDirPath:', subDirPath);

        if (!subDirPath) {
            console.warn("No programs subdirectory found. Skipping Cargo.toml amendment.");
            
            const programName = projectContext.name?.toLowerCase().replace(/\s+/g, "_") || "my_program";
            const fallbackPath = `programs/${programName}`;
            console.log(`Attempting to use fallback path: ${fallbackPath}`);
            
            try {
                console.log('[DEBUG_MERGE_FILE_TREE] About to amend Cargo.toml, Anchor.toml for fallback subDirPath=', fallbackPath);
                const result = await amendConfigFile(id, 'Cargo.toml', `${fallbackPath}/Cargo.toml`);
                console.log('[DEBUG_MERGE_FILE_TREE] amendConfigFile done for Cargo.toml with fallback path');
                console.log('result from fallback path:', result);
                await amendConfigFile(id, 'Anchor.toml', 'Anchor.toml');
                console.log('[DEBUG_MERGE_FILE_TREE] amendConfigFile done for Anchor.toml with fallback path');
            } catch (fallbackError) {
                console.error('Error using fallback path for Cargo.toml:', fallbackError);
            }
        } else {
            try {
                console.log('[DEBUG_MERGE_FILE_TREE] About to amend Cargo.toml, Anchor.toml for subDirPath=', subDirPath);
                const cargoTomlPath = `${subDirPath}/Cargo.toml`;
                const result = await amendConfigFile(id, 'Cargo.toml', cargoTomlPath);
                console.log('[DEBUG_MERGE_FILE_TREE] amendConfigFile done for Cargo.toml');
                console.log('result', result);
                await amendConfigFile(id, 'Anchor.toml', 'Anchor.toml');
                console.log('[DEBUG_MERGE_FILE_TREE] amendConfigFile done for Anchor.toml');
            } catch (error) {
                console.error('Error amending Cargo.toml:', error);
            }
        }

        const programName = projectContext.name?.toLowerCase().replace(/\s+/g, "_") || "my_program";
        const programId = projectContext.details?.projectState?.programId || "11111111111111111111111111111111";

        const newSrcTree = genSrcFiles(projectContext.details?.projectState!, programName, programId);

        let insertTaskIds: string[] = [];
        
        if (newSrcTree) {
            if (subDirPath) {
                const finalSrcBase = `${subDirPath}/src`;
                console.log('[DEBUG_MERGE_FILE_TREE] About to insert src files with insertSrcFiles(...) at path:', finalSrcBase);
                insertTaskIds = await insertSrcFiles(newSrcTree, id, existingFilePaths, finalSrcBase);
                console.log('[DEBUG_MERGE_FILE_TREE] Finished inserting src files, got task IDs:', insertTaskIds);
                allTaskIds.push(...insertTaskIds);
                
                console.log('[DEBUG_MERGE_FILE_TREE] Adding extra wait after src files insertion');
                await new Promise(resolve => setTimeout(resolve, 3000));
                console.log('[DEBUG_MERGE_FILE_TREE] Continuing after extra wait');
            } else {
                console.warn('No programs subdirectory found, placing src at root?');
                console.log('[DEBUG_MERGE_FILE_TREE] About to insert src files with insertSrcFiles(...) at root');
                insertTaskIds = await insertSrcFiles(newSrcTree, id, existingFilePaths);
                console.log('[DEBUG_MERGE_FILE_TREE] Finished inserting src files at root, got task IDs:', insertTaskIds);
                allTaskIds.push(...insertTaskIds);
            }
        } else {
            console.warn('[DEBUG_MERGE_FILE_TREE] newSrcTree is null, skipping insertSrcFiles operation');
        }

        console.log('[DEBUG_MERGE_FILE_TREE] fetchFilesAndCodes starting...');
        console.log('[DEBUG_MERGE_FILE_TREE] Passing afterCodeGen=' + isExplicitCodeGeneration);
        const { fileContentTaskIds } = await fetchFilesAndCodes(id, projectContext, setProjectContext, setFileTree, isExplicitCodeGeneration);
        console.log('[DEBUG_MERGE_FILE_TREE] fetchFilesAndCodes completed, got task IDs:', fileContentTaskIds);
        
        allTaskIds.push(...fileContentTaskIds);
        
        console.log(`[DEBUG_MERGE_FILE_TREE] Completed with ${allTaskIds.length} total task IDs`);
        return allTaskIds;
    } catch (error) {
        console.error('Error merging instructions:', error);
        return allTaskIds;
    }
}