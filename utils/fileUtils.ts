import fs, { Dirent } from 'fs';
import path from 'path';
import { APP_CONFIG } from '../config/appConfig';
import { AppError } from '../middleware/errorHandler';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { createTask, updateTaskStatus } from './taskUtils';
import { runCommand } from './projectUtils';

const SKIP_FOLDERS = ['.anchor', '.github', '.git', 'target', 'node_modules'];
const SKIP_FILES = [
  'Cargo.lock',
  'package-lock.json',
  'yarn.lock',
  '.DS_Store',
  '.gitignore',
  '.prettierignore',
];

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  ext?: string;
  path: string;
  children?: FileNode[];
}

export async function findFileRecursive(dir: string, fileName: string): Promise<string | null> {
  const files: Dirent[] = fs.readdirSync(dir, { withFileTypes: true }) as Dirent[];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      const result = await findFileRecursive(fullPath, fileName);
      if (result) return result;
    } else if (file.name === fileName) {
      return fullPath;
    }
  }

  return null;
}

export async function getProjectRootPath(projectId: string): Promise<string> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT root_path FROM SolanaProject WHERE id = $1',
      [projectId]
    );
    if (result.rows.length === 0) throw new AppError('Project not found', 404);
    return result.rows[0].root_path;
  } finally {
    client.release();
  }
}

export const deleteProjectFolder = async (
  rootPath: string,
  taskId: string
): Promise<void> => {
  const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);

  if (!fs.existsSync(projectPath)) {
    await updateTaskStatus(taskId, 'finished', 'Project folder does not exist');
    return;
  }

  try {
    await fs.promises.rm(projectPath, { recursive: true, force: true });
    await updateTaskStatus(
      taskId,
      'succeed',
      'Project folder deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting project folder:', error);
    await updateTaskStatus(taskId, 'failed', 'Failed to delete project folder');
  }
};

export const startDeleteProjectFolderTask = async (
  rootPath: string,
  creatorId: string
): Promise<string> => {
  const client = await pool.connect();
  try {
    const taskId = uuidv4();
    await client.query(
      'INSERT INTO Task (id, name, created_at, creator_id, status) VALUES ($1, $2, NOW(), $3, $4)',
      [taskId, 'Delete Project Folder', creatorId, 'doing']
    );

    setImmediate(() => deleteProjectFolder(rootPath, taskId));

    return taskId;
  } catch (error) {
    console.error('Error starting delete project folder task:', error);
    throw new AppError('Failed to start delete project folder task', 500);
  } finally {
    client.release();
  }
};

async function generateFileTree(
  dir: string,
  relativePath: string = ''
): Promise<FileNode[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const tree: FileNode[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory() && !SKIP_FOLDERS.includes(entry.name)) {
      const children = await generateFileTree(entryPath, entryRelativePath);
      tree.push({
        name: entry.name,
        type: 'directory',
        path: entryRelativePath,
        children,
      });
    } else if (entry.isFile() && !SKIP_FILES.includes(entry.name)) {
      tree.push({
        name: entry.name,
        ext: entry.name.split('.').pop(),
        type: 'file',
        path: entryRelativePath,
      });
    }
  }

  return tree;
}

async function createTempTask(operation: string, projectId: string, userId: string): Promise<string> {
  return await createTask(`Temp ${operation}`, userId, projectId);
}

async function generateFileTreeInContainer(
  containerName: string,
  rootPath: string,
  projectId: string,
  userId: string
): Promise<FileNode[]> {
  try {
    const tempTaskId = await createTempTask('find-command', projectId, userId);
    
    const excludePaths = SKIP_FOLDERS.map(folder => 
      `-path '*/\\${folder}' -prune`
    ).join(' -o ');
    
    const command = `docker exec ${containerName} bash -c "find /usr/src/${rootPath} \\( ${excludePaths} \\) -o -printf '%y %p\\n'"`;
    
    console.log(`Executing Docker find command: ${command}`);
    
    try {
      const output = await runCommand(command, '.', tempTaskId);
      
      const lines = output.split('\n').filter(Boolean);
      console.log(`Docker find command returned ${lines.length} lines`);
      
      console.log(`[DEBUG_FILES] Raw Docker find output (first 20 lines):`, lines.slice(0, 20));
      
      const instructionFiles = lines.filter(line => line.includes('/instructions/') && line.endsWith('.rs'));
      console.log(`[DEBUG_FILES] Found ${instructionFiles.length} instruction files:`, instructionFiles);
      
      const allItems: Array<{type: 'file' | 'directory', path: string, name: string}> = [];
      
      for (const line of lines) {
        try {
          const typeChar = line.charAt(0);
          const fullPath = line.substring(2);
          
          if (!fullPath || !fullPath.startsWith(`/usr/src/${rootPath}/`)) continue;
          
          const isDir = typeChar === 'd';
          const relativePath = fullPath.replace(`/usr/src/${rootPath}/`, '');
          
          if (!relativePath) continue;
          
          if (SKIP_FOLDERS.some(folder => relativePath.includes(`/${folder}/`))) continue;
          
          if (!isDir && SKIP_FILES.some(file => relativePath.endsWith(file))) continue;
          
          const pathParts = relativePath.split('/');
          const name = pathParts[pathParts.length - 1];
          
          allItems.push({
            type: isDir ? 'directory' : 'file',
            path: relativePath,
            name
          });
        } catch (lineParseError) {
          console.warn(`Skipping problematic line: "${line}"`, lineParseError);
          continue;
        }
      }
      
      const root: FileNode[] = [];
      const map = new Map<string, FileNode>();
      
      for (const item of allItems) {
        const node: FileNode = {
          name: item.name,
          type: item.type,
          path: item.path,
          children: item.type === 'directory' ? [] : undefined
        };
        
        if (item.type === 'file') {
          node.ext = item.name.split('.').pop();
        }
        
        map.set(item.path, node);
        
        if (!item.path.includes('/')) {
          root.push(node);
        }
      }
      
      for (const item of allItems) {
        if (item.path.includes('/')) {
          try {
            const lastSlashIndex = item.path.lastIndexOf('/');
            const parentPath = item.path.substring(0, lastSlashIndex);
            const parent = map.get(parentPath);
            
            if (parent && parent.children) {
              const node = map.get(item.path);
              if (node) {
                parent.children.push(node);
              }
            }
          } catch (treeError) {
            console.warn(`Error adding ${item.path} to tree:`, treeError);
          }
        }
      }
      
      if (allItems.some(item => item.path.includes('/programs/'))) {
        try {
          const programsCommand = `docker exec ${containerName} bash -c "find /usr/src/${rootPath}/programs -maxdepth 1 -type d | grep -v '/programs$'"`; 
          const programsOutput = await runCommand(programsCommand, '.', tempTaskId);
          const programDirs = programsOutput.split('\n').filter(Boolean);
          
          const programsNode = root.find(node => node.name === 'programs');
          if (!programsNode) {
            const programsNode: FileNode = {
              name: 'programs',
              type: 'directory',
              path: 'programs',
              children: []
            };
            root.push(programsNode);
            
            for (const programDir of programDirs) {
              const programName = programDir.split('/').pop() || '';
              if (!programName) continue;
              
              const programNode: FileNode = {
                name: programName,
                type: 'directory',
                path: `programs/${programName}`,
                children: []
              };
              
              programNode.children!.push({
                name: 'src',
                type: 'directory',
                path: `programs/${programName}/src`,
                children: []
              });
              
              programsNode.children!.push(programNode);
            }
          }
        } catch (programError) {
          console.warn('Error getting program directories:', programError);
        }
      }
      
      return root;
    } catch (execError) {
      console.error('Error executing Docker find command:', execError);
      
      console.log('Attempting simplified Docker directory listing...');
      
      const simplifiedCommand = `docker exec ${containerName} bash -c "find /usr/src/${rootPath} -maxdepth 2 -type d | grep -v 'node_modules\\|.git\\|target'"`; 
      
      const simplifiedOutput = await runCommand(simplifiedCommand, '.', tempTaskId);
      const dirs = simplifiedOutput.split('\n').filter(Boolean);
      
      const root: FileNode[] = [];
      
      for (const dir of dirs) {
        if (!dir.startsWith(`/usr/src/${rootPath}/`)) continue;
        
        const relativePath = dir.replace(`/usr/src/${rootPath}/`, '');
        if (!relativePath) continue;
        
        if (SKIP_FOLDERS.some(folder => relativePath.includes(folder))) continue;
        
        const name = relativePath.split('/').pop() || relativePath;
        
        if (!relativePath.includes('/')) {
          root.push({
            name,
            type: 'directory',
            path: relativePath,
            children: []
          });
        }
      }
      
      if (dirs.some(d => d.includes('/programs/'))) {
        try {
          const programsCommand = `docker exec ${containerName} bash -c "find /usr/src/${rootPath}/programs -maxdepth 1 -type d | grep -v '/programs$'"`; 
          const programsOutput = await runCommand(programsCommand, '.', tempTaskId);
          const programDirs = programsOutput.split('\n').filter(Boolean);
          
          const programsNode = root.find(node => node.name === 'programs');
          if (!programsNode) {
            const programsNode: FileNode = {
              name: 'programs',
              type: 'directory',
              path: 'programs',
              children: []
            };
            root.push(programsNode);
            
            for (const programDir of programDirs) {
              const programName = programDir.split('/').pop() || '';
              if (!programName) continue;
              
              const programNode: FileNode = {
                name: programName,
                type: 'directory',
                path: `programs/${programName}`,
                children: []
              };
              
              programNode.children!.push({
                name: 'src',
                type: 'directory',
                path: `programs/${programName}/src`,
                children: []
              });
              
              programsNode.children!.push(programNode);
            }
          }
        } catch (programError) {
          console.warn('Error getting program directories:', programError);
        }
      }
      
      return root;
    }
  } catch (error) {
    console.error('Error generating file tree in container:', error);
    throw error;
  }
}

export const startGenerateFileTreeTask = async (
  projectId: string,
  rootPath: string,
  creatorId: string
): Promise<string> => {
  try {
    const taskId = await createTask('Generate File Tree', creatorId, projectId);
    setImmediate(async () => {
      try {
        let fileTree: FileNode[] = [];
        
        const containerQuery = await pool.query(
          'SELECT container_name FROM SolanaProject WHERE id = $1',
          [projectId]
        );
        
        const containerName = containerQuery.rows.length > 0 ? containerQuery.rows[0].container_name : null;
        
        if (containerName) {
          try {
            console.log(`Generating file tree in container ${containerName} for project ${projectId}`);
            fileTree = await generateFileTreeInContainer(containerName, rootPath, projectId, creatorId);
          } catch (containerError) {
            console.error('Error generating file tree in container:', containerError);
            console.log('Falling back to local file system for file tree generation');
            const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
            fileTree = await generateFileTree(projectPath);
          }
        } else {
          console.log('No container found, using local file system for file tree generation');
          const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
          fileTree = await generateFileTree(projectPath);
        }
        
        const treeResult = JSON.stringify(fileTree);
        await updateTaskStatus(taskId, 'succeed', treeResult);
      } catch (error) {
        console.error('Error generating file tree:', error);
        await updateTaskStatus(
          taskId,
          'failed',
          'Failed to generate file tree: ' + (error instanceof Error ? error.message : String(error))
        );
      }
    });

    return taskId;
  } catch (error) {
    console.error('Error starting generate file tree task:', error);
    throw new AppError('Failed to start generate file tree task', 500);
  }
};

export const startGetFileContentTask = async (
  projectId: string,
  filePath: string,
  creatorId: string 
): Promise<string> => {
  const taskId = await createTask('Get File Content', creatorId, projectId);
  setImmediate(async () => {
    try {
      const containerQuery = await pool.query(
        'SELECT container_name FROM SolanaProject WHERE id = $1',
        [projectId]
      );
      
      const containerName = containerQuery.rows.length > 0 ? containerQuery.rows[0].container_name : null;
      const projectRootPath = await getProjectRootPath(projectId);
      
      let content: string;
      
      if (containerName) {
        try {
          console.log(`Reading file ${filePath} from container ${containerName}`);
          const readCmd = `docker exec ${containerName} cat /usr/src/${projectRootPath}/${filePath}`;
          content = await runCommand(readCmd, '.', taskId);
          console.log(`Successfully read file from container: ${filePath}`);
        } catch (containerError) {
          console.error(`Error reading file ${filePath} from container:`, containerError);
          console.log('Falling back to local file system for file content');
          const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
          content = await fs.promises.readFile(fullPath, 'utf-8');
        }
      } else {
        console.log('No container found, using local file system for file content');
        const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
        content = await fs.promises.readFile(fullPath, 'utf-8');
      }
      
      await updateTaskStatus(taskId, 'succeed', content);
    } catch (error) {
      console.error('Error reading file:', error);
      await updateTaskStatus(taskId, 'failed', `Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  return taskId;
};

export const startCreateFileTask = async (
  projectId: string,
  filePath: string,
  content: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Create File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const containerQuery = await pool.query(
        'SELECT container_name FROM SolanaProject WHERE id = $1',
        [projectId]
      );
      
      const containerName = containerQuery.rows.length > 0 ? containerQuery.rows[0].container_name : null;
      const projectRootPath = await getProjectRootPath(projectId);
      
      if (containerName) {
        try {
          console.log(`Creating file ${filePath} in container ${containerName}`);
          const dirPath = path.dirname(filePath);
          if (dirPath && dirPath !== '.') {
            const mkdirCmd = `docker exec ${containerName} mkdir -p /usr/src/${projectRootPath}/${dirPath}`;
            await runCommand(mkdirCmd, '.', taskId);
          }
          
          const writeCmd = `
            docker exec -i ${containerName} bash -c "cat > /usr/src/${projectRootPath}/${filePath}" << 'EOF'
${content}
EOF`;
          await runCommand(writeCmd, '.', taskId);
          console.log(`Successfully created file in container: ${filePath}`);
          await updateTaskStatus(taskId, 'succeed', 'File created successfully in container');
        } catch (containerError) {
          console.error(`Error creating file ${filePath} in container:`, containerError);
          console.log('Falling back to local file system for file creation');
          const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
          await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.promises.writeFile(fullPath, content, 'utf-8');
          await updateTaskStatus(taskId, 'succeed', 'File created successfully (local fallback)');
        }
      } else {
        console.log('No container found, using local file system for file creation');
        const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, content, 'utf-8');
        await updateTaskStatus(taskId, 'succeed', 'File created successfully');
      }
    } catch (error) {
      console.error('Error creating file:', error);
      await updateTaskStatus(
        taskId, 
        'failed', 
        `Failed to create file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return taskId;
};

export const startUpdateFileTask = async (
  projectId: string,
  filePath: string,
  content: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Update File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const containerQuery = await pool.query(
        'SELECT container_name FROM SolanaProject WHERE id = $1',
        [projectId]
      );
      
      const containerName = containerQuery.rows.length > 0 ? containerQuery.rows[0].container_name : null;
      const projectRootPath = await getProjectRootPath(projectId);
      
      if (containerName) {
        try {
          console.log(`Updating file ${filePath} in container ${containerName}`);
          
          const writeCmd = `
            docker exec -i ${containerName} bash -c "cat > /usr/src/${projectRootPath}/${filePath}" << 'EOF'
${content}
EOF`;
          await runCommand(writeCmd, '.', taskId);
          console.log(`Successfully updated file in container: ${filePath}`);
          await updateTaskStatus(taskId, 'succeed', 'File updated successfully in container');
        } catch (containerError) {
          console.error(`Error updating file ${filePath} in container:`, containerError);
          console.log('Falling back to local file system for file update');
          const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
          await fs.promises.writeFile(fullPath, content, 'utf-8');
          await updateTaskStatus(taskId, 'succeed', 'File updated successfully (local fallback)');
        }
      } else {
        console.log('No container found, using local file system for file update');
        const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
        await fs.promises.writeFile(fullPath, content, 'utf-8');
        await updateTaskStatus(taskId, 'succeed', 'File updated successfully');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      await updateTaskStatus(
        taskId, 
        'failed', 
        `Failed to update file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return taskId;
};

export const startDeleteFileTask = async (
  projectId: string,
  filePath: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Delete File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const containerQuery = await pool.query(
        'SELECT container_name FROM SolanaProject WHERE id = $1',
        [projectId]
      );
      
      const containerName = containerQuery.rows.length > 0 ? containerQuery.rows[0].container_name : null;
      const projectRootPath = await getProjectRootPath(projectId);
      
      if (containerName) {
        try {
          console.log(`Deleting file ${filePath} from container ${containerName}`);
          
          const deleteCmd = `docker exec ${containerName} rm /usr/src/${projectRootPath}/${filePath}`;
          await runCommand(deleteCmd, '.', taskId);
          console.log(`Successfully deleted file from container: ${filePath}`);
          await updateTaskStatus(taskId, 'succeed', 'File deleted successfully from container');
        } catch (containerError) {
          console.error(`Error deleting file ${filePath} from container:`, containerError);
          console.log('Falling back to local file system for file deletion');
          const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
          await fs.promises.unlink(fullPath);
          await updateTaskStatus(taskId, 'succeed', 'File deleted successfully (local fallback)');
        }
      } else {
        console.log('No container found, using local file system for file deletion');
        const fullPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, filePath);
        await fs.promises.unlink(fullPath);
        await updateTaskStatus(taskId, 'succeed', 'File deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      await updateTaskStatus(
        taskId, 
        'failed', 
        `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return taskId;
};
