import { FileTreeItemType } from '@/interfaces/FileTreeItemType';
import { fileApi } from '@/api/fileApi';

export const ignoreFiles = [
    'node_modules',
    '.git',
    '.gitignore',
    'yarn.lock',
    '.vscode',
    '.idea',
    '.DS_Store',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    '.prettierignore',
    'deploy',
    'release',
    '.fingerprint',
    'build',
    'deps',
    'incremental',
    'target',
    '__pycache__',
    '.cache',
    '.log',
    'Cargo.lock',
  ];
  const binaryExtensions = [
    '.rlib',
    '.so',
    '.o',
    '.exe',
    '.dll',
    '.a',
    '.dylib',
    '.class',
    '.jar',
    '.bin',
    '.dat',
    '.tar',
    '.zip',
    '.7z',
    '.gz',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
  ];

export const filterFiles = (projectContextRootPath: string) => (item: FileTreeItemType): boolean => {
    console.debug(`[filterFiles] Checking file: ${item.path}`);
    
    const ignoredDirs = ignoreFiles.some((dir) => item?.path?.includes(dir));
    const isBinaryFile = binaryExtensions.some((ext) => item.name.endsWith(ext));
  
    if (ignoredDirs) {
      console.warn(`[filterFiles] Skipping directory because it's in ignoreFiles: ${item.path}`);
      return false;
    }
    if (isBinaryFile) {
      console.warn(`[filterFiles] Skipping binary file: ${item.path}`);
      return false;
    }
  
    if (item?.path?.includes('/target/') || item?.path?.includes('/deploy/')) {
      console.warn(`[filterFiles] Skipping /target or /deploy directory: ${item.path}`);
      return false;
    }
  
    const isIndexJs = item?.name?.endsWith('sdk/index.js') || item?.name === 'index.js';
    if (isIndexJs) {
      console.warn(`[filterFiles] Skipping index.js or sdk/index.js: ${item.path}`);
      return false; 
    }
    if (item.name === 'sdk' || item.path?.includes('/sdk/')) {
      console.debug(`[filterFiles] Found "sdk" dir or file, allowing: ${item.path}`);
      return true;
    }
    
    // Special debug for instruction files
    if (item.path?.includes('/instructions/') && item.name.endsWith('.rs')) {
      console.debug(`[filterFiles] Found instruction Rust file: ${item.path}`);
    }
  
    // IMPORTANT: We now allow subdirectories and files under the project path.
    // Previously this was causing instruction files to be filtered out.
    console.debug(`[filterFiles] ACCEPTING file/dir: ${item.path}`);
    return true;
  };

export function mapFileTreeNodeToItemType(node: any): FileTreeItemType {
    const mappedChildren = node.children
      ? node.children.map(mapFileTreeNodeToItemType).filter(filterFiles)
      : undefined;
  
    return {
      name: node.name,
      path: node.path,
      type: node.type === 'directory' ? 'directory' : 'file',
      ext: node.type === 'directory' ? undefined : node.name.split('.').pop(),
      children: mappedChildren,
    };
}

export function gatherPathsFromTree(treeItems: FileTreeItemType[]): Set<string> {
  const paths = new Set<string>();

  function traverse(node: FileTreeItemType, parentPath = '') {
    const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === 'file') {
      paths.add(nodePath);
    } 
    if (node.type === 'directory' && node.children) {
      node.children.forEach(child => traverse(child, nodePath));
    }
  }

  treeItems.forEach(item => traverse(item));
  return paths;
}


// returns fileTree, fileNames and filePaths
export async function fetchFileInfo(
    projectId: string,
    projectName: string,
    mapFileTreeNodeToItemType: (node: any) => FileTreeItemType,
    filterFiles: (file: FileTreeItemType) => boolean,
): Promise<{ fileTree: FileTreeItemType, filePaths: Set<string>, fileNames: Set<string> }> {
    try {
        const existingFilesResponse = await fileApi.getDirectoryStructure(projectId);
        if (!existingFilesResponse) throw new Error("Directory structure not found");

        const mappedFiles = existingFilesResponse
            .map(mapFileTreeNodeToItemType)
            .filter(filterFiles);

        const _fileTree: FileTreeItemType = {
            name: projectName,
            path: './',
            type: 'directory',
            children: mappedFiles,
        };

        const traverseFileTree = (
            nodes: FileTreeItemType[],
            filePaths: Set<string>,
            fileNames: Set<string>
        ) => {
            for (const node of nodes) {
                if (node.type === "file" && node.path) {
                    filePaths.add(node.path);
                    fileNames.add(node.name);
                } else if (node.type === "directory" && node.children) {
                    traverseFileTree(node.children, filePaths, fileNames);
                }
            }
        };

        const existingFilePaths = new Set<string>();
        const existingFileNames = new Set<string>();
        traverseFileTree(mappedFiles, existingFilePaths, existingFileNames);

        return { fileTree: _fileTree, filePaths: existingFilePaths, fileNames: existingFileNames };
    } catch (error) {
        console.error("Error fetching file tree and paths:", error);
        throw error;
    }
}

/**
 * Checks if a file path is likely to be an Anchor source file
 * This helps avoid trying to read files that don't exist in the container
 */
export function isAnchorSourceFile(filePath: string): boolean {
  // Check if the file is inside programs/<program>/src
  const isProgramSrc = filePath.includes('/programs/') && filePath.includes('/src/');
  
  // Check if the file has a valid Rust extension
  const isRustFile = filePath.endsWith('.rs');
  
  // Accept ALL Rust files in program source directories
  // Previously we were filtering to only specific files, which excluded instruction files
  return isProgramSrc && isRustFile;
}

/**
 * Updates or creates a file in the correct location (container or host filesystem)
 * and waits for filesystem stability before returning
 */
export async function updateOrCreateFile(
    projectId: string,
    path: string,
    content: string,
    existingFilePaths: Set<string>
): Promise<string | null> {
    try {
        let response;
        let taskId: string | null = null;

        if (existingFilePaths.has(path)) {
            console.log(`[DEBUG_FILE_UTILS] Updating existing file: ${path}`);
            response = await fileApi.updateFile(projectId, path, content);
            taskId = response.taskId || null;
            console.log(`[DEBUG_FILE_UTILS] File update task created with ID: ${taskId}`);
        } else {
            console.log(`[DEBUG_FILE_UTILS] Creating new file: ${path}`);
            response = await fileApi.createFile(projectId, path, content);
            taskId = response.taskId || null;
            console.log(`[DEBUG_FILE_UTILS] File creation task created with ID: ${taskId}`);
            
            // Special handling for instruction files
            if (path.includes('/instructions/') && path.endsWith('.rs')) {
                console.log(`[DEBUG_FILE_UTILS] Instruction file created: ${path}. Adding delay for filesystem stability.`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return taskId;
    } catch (error) {
        console.error(`[DEBUG_FILE_UTILS] Error updating/creating file ${path}:`, error);
        return null;
    }
}

function transformItem(rawItem: any): FileTreeItemType {
  return {
    name: rawItem.name ?? '',
    ext: rawItem.ext,
    type: rawItem.type,
    path: rawItem.path,
    status: rawItem.status,
    code: rawItem.code,
    // If there are child items, transform them; otherwise empty array.
    children: Array.isArray(rawItem.children)
      ? rawItem.children.map(transformItem)
      : [],
  };
}

export function buildSingleRootNode(rawTree: any[], projectName: string): FileTreeItemType {
  return {
    name: projectName,
    type: 'directory',
    children: rawTree.map(transformItem),
    // Optionally give it a path, ext, status, etc. if you need
  };
}