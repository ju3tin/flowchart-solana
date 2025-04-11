import { fileApi } from '@/api/fileApi';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';
import { pollTaskStatus2 } from '@/utils/task/taskUtils';
import { isAnchorSourceFile } from '@/utils/files/fileUtils';

export async function populateFileContent(
  tree: FileTreeItemType[],
  projectId: string
): Promise<string[]> {
  const fileContentTaskIds: string[] = [];

  const processNode = async (node: FileTreeItemType): Promise<void> => {
    console.debug(`[populateFileContent] Checking node: ${node.path}, type=${node.type}`);

    if (node.type === 'file') {
      try {
        if (node.path && node.path.includes('/programs/') && 
            !isAnchorSourceFile(node.path)) {
          console.warn(`[populateFileContent] Skipping non-Rust file in programs directory: ${node.path}`);
          return;
        }
        
        let content = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (content === null && attempts < maxAttempts) {
          attempts++;
          try {
            console.debug(`[populateFileContent] Attempt #${attempts} for ${node.path}`);
            const response = await fileApi.getFileContent(projectId, node.path || '');
            const { taskId } = response;
            
            if (taskId) {
              console.debug(`[populateFileContent] Adding taskId ${taskId} for file ${node.path}`);
              fileContentTaskIds.push(taskId);
            }
            
            try {
              content = await pollTaskStatus2(taskId);
              node.code = content;
              console.debug(`[populateFileContent] Loaded content for ${node.path} on attempt #${attempts}`);
            } catch (pollError) {
              console.error(`[populateFileContent] Error polling content for ${node.path} (attempt ${attempts}):`, pollError);
              
              if (attempts < maxAttempts) {
                console.log(`Waiting before retry for ${node.path}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                node.code = `// Error: Could not load file content after ${maxAttempts} attempts.\n// The file may not exist in the container yet.\n// Path: ${node.path}`;
              }
            }
          } catch (error) {
            console.error(`[populateFileContent] Error fetching file ${node.path} (attempt ${attempts}):`, error);
            
            if (attempts < maxAttempts) {
              console.log(`Waiting before retry for ${node.path}...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              node.code = `// Error: Could not load file content after ${maxAttempts} attempts\n// Path: ${node.path}`;
            }
          }
        }
      } catch (error) {
        console.error(`[populateFileContent] Unexpected error for ${node.path}:`, error);
        node.code = `// Error: Unexpected error processing file: ${node.path}`;
      }
    } else if (node.type === 'directory' && node.children) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  };

  for (const node of tree) {
    await processNode(node);
  }

  console.debug(`[populateFileContent] Collected ${fileContentTaskIds.length} file content task IDs`);
  return fileContentTaskIds;
}
