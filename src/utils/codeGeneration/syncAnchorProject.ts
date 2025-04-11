import { FileTreeItemType } from '@/interfaces/FileTreeItemType';
import { ProjectContextType } from '@/context/project/ProjectContextTypes';
import { mapFileTreeNodeToItemType } from '@/utils/files/fileUtils';
import { filterFiles } from '@/utils/files/fileUtils';
import { fetchFileInfo } from '@/utils/files/fileUtils';   
import { projectApi } from '@/api/projectApi';
import { pascalToSnakeCase } from '@/utils/string/stringUtils';

export async function syncAnchorProject(
  projectContext: ProjectContextType,
  setFileTree: (tree: FileTreeItemType) => void
): Promise<void> {
  try {
    const rootPath = await projectApi.getProjectRootPath(projectContext.id || '');
    
    console.log("[DEBUG_SYNC_ANCHOR] First fetch to get initial file tree state");
    const initialFetch = await fetchFileInfo(
      projectContext.id || '',
      projectContext.name || '' ,
      mapFileTreeNodeToItemType,
      filterFiles(rootPath)
    );

    const instructions = projectContext.details?.projectState?.instructions || [];
    if (instructions.length > 0) {
      console.log(`[DEBUG_SYNC_ANCHOR] Project has ${instructions.length} instructions, ensuring all files are accessible...`);
      
      console.log("[DEBUG_SYNC_ANCHOR] Waiting 5 seconds for Docker file system to stabilize");
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const expectedFiles = instructions.map(instr => {
        const instructionName = instr.label ? pascalToSnakeCase(instr.label) : '';
        return `${instructionName}.rs`;
      }).filter(name => name !== '.rs');
      console.log(`[DEBUG_SYNC_ANCHOR] Looking for instruction files: ${expectedFiles.join(', ')}`);
      
      console.log("[DEBUG_SYNC_ANCHOR] Refreshing file tree after delay");
      const refreshed = await fetchFileInfo(
        projectContext.id || '',
        projectContext.name || '',
        mapFileTreeNodeToItemType,
        filterFiles(rootPath)
      );
      
      function findInstructionFiles(tree: FileTreeItemType[]): string[] {
        const instructionFiles: string[] = [];
        
        function traverse(node: FileTreeItemType) {
          if (node.path?.includes('/instructions/') && node.name.endsWith('.rs')) {
            instructionFiles.push(node.path);
          }
          
          if (node.children) {
            node.children.forEach(traverse);
          }
        }
        
        tree.forEach(traverse);
        return instructionFiles;
      }
      
      if (refreshed.fileTree.children) {
        const foundFiles = findInstructionFiles(refreshed.fileTree.children);
        console.log(`[DEBUG_SYNC_ANCHOR] Found ${foundFiles.length} instruction files in refreshed tree:`, foundFiles);
      }
      
      setFileTree(refreshed.fileTree);
    } else {
      console.log("[DEBUG_SYNC_ANCHOR] No instructions in project, using initial file tree");
      setFileTree(initialFetch.fileTree);
    }
  } catch (error) {
    console.error('[DEBUG_SYNC_ANCHOR] Error syncing anchor project:', error);
  }
}
