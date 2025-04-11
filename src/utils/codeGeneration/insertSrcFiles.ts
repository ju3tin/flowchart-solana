import { updateOrCreateFile } from '@/utils/files/fileUtils';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';

export async function insertSrcFiles(
  node: FileTreeItemType,
  projectId: string,
  existingFilePaths: Set<string>,
  basePath?: string
): Promise<string[]> {
  const thisPath = basePath ?? node.path;
  const fileTaskIds: string[] = [];

  console.log(`[DEBUG_INSERT_SRC] Starting insertion of source files at base path: ${thisPath}`);

  const instructionFiles: {path: string, code: string}[] = [];
  
  const gatherInstructionFiles = (node: FileTreeItemType, path: string) => {
    if (node.type === 'file' && path.includes('/instructions/') && path.endsWith('.rs')) {
      instructionFiles.push({path, code: node.code || ''});
    } else if (node.type === 'directory' && node.children) {
      for (const child of node.children) {
        gatherInstructionFiles(child, `${path}/${child.name}`);
      }
    }
  };
  
  if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      gatherInstructionFiles(child, `${thisPath}/${child.name}`);
    }
  } else if (node.type === 'file' && thisPath && thisPath.includes('/instructions/') && thisPath.endsWith('.rs')) {
    instructionFiles.push({path: thisPath, code: node.code || ''});
  }
  
  if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      const childPath = `${thisPath}/${child.name}`;
      
      if (childPath.includes('/instructions/') && childPath.endsWith('.rs')) {
        console.log(`[DEBUG_INSERT_SRC] Deferring instruction file for later processing: ${childPath}`);
        continue;
      }
      
      const childTaskIds = await insertSrcFiles(child, projectId, existingFilePaths, childPath);
      fileTaskIds.push(...childTaskIds);
    }
  } else if (node.type === 'file' && thisPath && !(thisPath.includes('/instructions/') && thisPath.endsWith('.rs'))) {
    const taskId = await updateOrCreateFile(projectId, thisPath, node.code || '', existingFilePaths);
    if (taskId) {
      console.log(`[DEBUG_INSERT_SRC] Added taskId ${taskId} for non-instruction file: ${thisPath}`);
      fileTaskIds.push(taskId);
    }
    console.log(`[DEBUG_INSERT_SRC] Successfully processed non-instruction file: ${thisPath}`);
  }
  
  if (instructionFiles.length > 0) {
    console.log(`[DEBUG_INSERT_SRC] Processing ${instructionFiles.length} instruction files with special handling`);
    
    for (const file of instructionFiles) {
      console.log(`[DEBUG_INSERT_SRC] Creating instruction file: ${file.path}`);
      const taskId = await updateOrCreateFile(projectId, file.path, file.code, existingFilePaths);
      if (taskId) {
        console.log(`[DEBUG_INSERT_SRC] Added taskId ${taskId} for instruction file: ${file.path}`);
        fileTaskIds.push(taskId);
      }
      console.log(`[DEBUG_INSERT_SRC] Waiting after creating instruction file: ${file.path}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('[DEBUG_INSERT_SRC] All instruction files processed. Waiting for filesystem stability...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('[DEBUG_INSERT_SRC] Done waiting for filesystem stability');
  }

  console.log(`[DEBUG_INSERT_SRC] Returning ${fileTaskIds.length} task IDs from ${thisPath}`);
  return fileTaskIds;
}