import { createTask, updateTaskStatus, ensureDirectoryExists } from './taskUtils';
import { runCommand } from './projectUtils';
import { getProjectRootPath } from './fileUtils';
import pool from '../config/database';

async function getContainerName(projectId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT container_name FROM solanaproject WHERE id = $1',
    [projectId]
  );
  
  if (result.rows.length === 0 || !result.rows[0].container_name) {
    return null;
  }
  
  return result.rows[0].container_name;
}

export async function createFileInContainer(
  projectId: string, 
  relativePath: string, 
  content: string,
  creatorId: string
): Promise<{ taskId: string }> {
  const containerName = await getContainerName(projectId);
  if (!containerName) {
    throw new Error(`No container found for project ${projectId}`);
  }

  const taskId = await createTask(`Create file ${relativePath}`, creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      
      const dirPath = relativePath.split('/').slice(0, -1).join('/');
      if (dirPath) {
        const fullDirPath = `/usr/src/${rootPath}/${dirPath}`;
        console.log(`[DEBUG_FILE] Ensuring directory exists: ${fullDirPath}`);
        await ensureDirectoryExists(fullDirPath, containerName);
      }

      const writeCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/${relativePath}" << 'EOF'
${content}
EOF`;
      
      await runCommand(writeCmd, '.', taskId);
      await updateTaskStatus(taskId, 'succeed', `File ${relativePath} created successfully`);
    } catch (error: any) {
      console.error(`Error creating file ${relativePath} in container:`, error);
      await updateTaskStatus(taskId, 'failed', `Failed to create file: ${error.message}`);
    }
  });

  return { taskId };
}

export async function updateFileInContainer(
  projectId: string, 
  relativePath: string, 
  content: string,
  creatorId: string
): Promise<{ taskId: string }> {
  const containerName = await getContainerName(projectId);
  if (!containerName) {
    throw new Error(`No container found for project ${projectId}`);
  }

  const taskId = await createTask(`Update file ${relativePath}`, creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      
      const dirPath = relativePath.split('/').slice(0, -1).join('/');
      if (dirPath) {
        const fullDirPath = `/usr/src/${rootPath}/${dirPath}`;
        console.log(`[DEBUG_FILE] Ensuring directory exists before update: ${fullDirPath}`);
        await ensureDirectoryExists(fullDirPath, containerName);
      }
      
      const writeCmd = `
        docker exec -i ${containerName} bash -c "cat > /usr/src/${rootPath}/${relativePath}" << 'EOF'
${content}
EOF`;
      
      await runCommand(writeCmd, '.', taskId);
      await updateTaskStatus(taskId, 'succeed', `File ${relativePath} updated successfully`);
    } catch (error: any) {
      console.error(`Error updating file ${relativePath} in container:`, error);
      await updateTaskStatus(taskId, 'failed', `Failed to update file: ${error.message}`);
    }
  });

  return { taskId };
}

export async function getFileContentFromContainer(
  projectId: string, 
  relativePath: string,
  creatorId: string
): Promise<{ taskId: string }> {
  const containerName = await getContainerName(projectId);
  if (!containerName) {
    throw new Error(`No container found for project ${projectId}`);
  }

  const taskId = await createTask(`Get file content for ${relativePath}`, creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      
      const readCmd = `docker exec ${containerName} cat /usr/src/${rootPath}/${relativePath}`;
      const content = await runCommand(readCmd, '.', taskId);
      
      await updateTaskStatus(taskId, 'succeed', content);
    } catch (error: any) {
      console.error(`Error reading file ${relativePath} from container:`, error);
      await updateTaskStatus(taskId, 'failed', `Failed to read file: ${error.message}`);
    }
  });

  return { taskId };
}

export async function installDependenciesInContainer(
  projectId: string,
  packages: string[],
  creatorId: string,
  targetDir: 'app' | 'server' = 'app'
): Promise<{ taskId: string }> {
  const containerName = await getContainerName(projectId);
  if (!containerName) {
    throw new Error(`No container found for project ${projectId}`);
  }

  const taskId = await createTask(`Install dependencies in ${targetDir}`, creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);

      const targetPath = `/usr/src/${rootPath}/${targetDir}`;
      console.log(`[DEBUG_FILE] Ensuring target directory exists for dependencies: ${targetPath}`);
      await ensureDirectoryExists(targetPath, containerName);
      
      const packageList = packages.join(' ');
      const installCmd = `docker exec ${containerName} bash -c "cd ${targetPath} && npm install ${packageList}"`;
      
      const result = await runCommand(installCmd, '.', taskId);
      await updateTaskStatus(taskId, 'succeed', `Packages installed successfully: ${packageList}`);
    } catch (error: any) {
      console.error(`Error installing packages in container:`, error);
      await updateTaskStatus(taskId, 'failed', `Failed to install packages: ${error.message}`);
    }
  });

  return { taskId };
} 