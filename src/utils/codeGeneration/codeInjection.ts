import React from 'react';
import { taskApi } from '../../api/taskApi';
import { toast } from 'sonner';
import { getFilesForNodeType, getDependenciesForNodeType, NodeType } from '../../data/nodes/registryManager';
import { ProjectContextType } from '../../context/project/ProjectContextTypes';
import { containerFileApi } from '../../api/containerFileApi';

function getDestinationFolder(originalPath: string): string {
  const fileName = originalPath.split('/').pop() || '';

  if (fileName.endsWith('.tsx')) {
    return `src/components/${fileName}`;
  } else if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
    return `src/styles/${fileName}`;
  } else {
    return `src/utils/${fileName}`;
  }
}

export const codeInjection = {
  injectNodeCode: async (
    projectId: string, 
    nodeType: NodeType, 
    setProjectContext?: React.Dispatch<React.SetStateAction<ProjectContextType>>
  ): Promise<void> => {
    console.log(`Starting code injection for node type: ${nodeType}, projectId: ${projectId}`);
    
    if (setProjectContext) {
      console.log(`Adding ${nodeType} to injectingNodeTypes`);
      setProjectContext(prev => {
        const updatedContext = {
          ...prev,
          injectingNodeTypes: [...(prev.injectingNodeTypes || []), nodeType]
        };
        console.log('Updated injectingNodeTypes:', updatedContext.injectingNodeTypes);
        return updatedContext;
      });
    }
    
    if (!projectId) {
      console.error("ProjectId is undefined. Cannot inject code.");
      if (setProjectContext) {
        setProjectContext(prev => ({
          ...prev,
          injectingNodeTypes: (prev.injectingNodeTypes || []).filter(type => type !== nodeType)
        }));
      }
      throw new Error("ProjectId is undefined. Cannot inject code.");
    }
    
    try {
      const files = await getFilesForNodeType(nodeType as NodeType);
      console.log(`Files for node type ${nodeType}:`, files);
      
      if (!files || files.length === 0) {
        console.log(`No files found for node type: ${nodeType}. Skipping code injection.`);
        if (setProjectContext) {
          setProjectContext(prev => ({
            ...prev,
            injectingNodeTypes: (prev.injectingNodeTypes || []).filter(type => type !== nodeType)
          }));
        }
        return; 
      }
      
      toast.info("Adding Code", {
        description: `Setting up code for ${nodeType}...`,
        duration: 3000,
      });
      
      const dependencies = await getDependenciesForNodeType(nodeType as NodeType);
      console.log(`Dependencies for node type ${nodeType}:`, dependencies);
      
      if (Object.keys(dependencies).length > 0) {
        await updatePackageJsonInContainer(projectId, dependencies);
        
        const packageList = Object.entries(dependencies).map(
          ([name, version]) => `${name}@${version}`
        );
        
        console.log(`Installing dependencies first: ${packageList.join(', ')}`);
        toast.info("Installing Dependencies", {
          description: `Installing ${packageList.length} packages...`,
          duration: 3000,
        });
        
        try {
          console.log(`Installing dependencies in container for projectId: ${projectId}`);
          console.log(`Package list: ${JSON.stringify(packageList)}`);
          
          const installResponse = await containerFileApi.installDependencies(projectId, packageList);
          console.log(`Dependency installation response:`, installResponse);
          console.log(`Dependency installation task started with ID: ${installResponse.taskId}`);
          
          await new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(async () => {
              try {
                const taskData = await taskApi.getTask(installResponse.taskId);
                console.log(`Dependency installation status: ${taskData.task.status}, result: ${taskData.task.result || 'N/A'}`);
                
                if (taskData.task.status === 'succeed' || taskData.task.status === 'finished') {
                  clearInterval(checkInterval);
                  console.log(`Dependency installation succeeded with result: ${taskData.task.result}`);
                  toast.success("Dependencies Installed", {
                    description: "Package installation complete",
                    duration: 3000,
                  });
                  resolve();
                } else if (taskData.task.status === 'failed') {
                  clearInterval(checkInterval);
                  console.error(`Dependency installation failed: ${taskData.task.result}`);
                  reject(new Error(taskData.task.result || "Installation failed"));
                }
              } catch (err) {
                clearInterval(checkInterval);
                console.error('Error checking installation status:', err);
                reject(err);
              }
            }, 1000);
            
            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error('Timeout waiting for dependencies to install'));
            }, 60000);
          });
        } catch (error) {
          console.error('Error installing dependencies:', error);
          toast.warning("Warning", {
            description: "Could not install dependencies, but will still try to create files",
            duration: 5000,
          });
        }
      }
      
      console.log("Creating files now that dependencies are installed...");
      
      const tasks: { path: string; taskId: string }[] = [];
      
      for (const file of files) {
        try {
          const originalPath = file.path;
          const finalPath = getDestinationFolder(originalPath);
          
          console.log(`Creating file: ${finalPath} (originally ${originalPath})`);
          console.log(`File content length: ${file.content?.length || 0} characters`);
          
          if (!file.content) {
            console.warn(`Warning: Empty content for file ${finalPath}`);
          }
          
          const response = await containerFileApi.createFile(projectId, finalPath, file.content || '');
          console.log(`File creation task initiated with ID: ${response.taskId}`);
          tasks.push({ path: finalPath, taskId: response.taskId });
        } catch (error: any) {
          console.error(`Failed to create file: ${file.path}`, error);
          console.error(`Error details: ${error.message}`);
          if (error.response) {
            console.error(`Server response: ${JSON.stringify(error.response.data)}`);
          }
        }
      }
      
      if (tasks.length === 0) {
        console.error("No files were created successfully");
        toast.error("Error", {
          description: "Failed to create any files for this node",
          duration: 5000,
        });
        return;
      }
      
      const pollInterval = setInterval(async () => {
        let allCompleted = true;
        let failedCount = 0;
        
        for (const task of tasks) {
          try {
            const taskData = await taskApi.getTask(task.taskId);
            console.log(`Task status for ${task.path}:`, taskData.task.status);
            
            if (taskData.task.status === 'queued' || taskData.task.status === 'doing') {
              allCompleted = false;
            } else if (taskData.task.status === 'failed') {
              failedCount++;
            }
          } catch (error) {
            console.error(`Error checking task status for ${task.path}:`, error);
            failedCount++;
          }
        }
        
        if (allCompleted) {
          clearInterval(pollInterval);
          
          if (setProjectContext) {
            console.log(`Removing ${nodeType} from injectingNodeTypes (completed)`);
            setProjectContext(prev => {
              const updatedTypes = (prev.injectingNodeTypes || []).filter(type => type !== nodeType);
              console.log('Updated injectingNodeTypes after completion:', updatedTypes);
              return {
                ...prev,
                injectingNodeTypes: updatedTypes
              };
            });
          }
          
          if (failedCount > 0) {
            toast.warning("Partial Success", {
              description: `Added some files, but ${failedCount} files failed to create`,
              duration: 5000,
            });
          } else {
            toast.success("Success", {
              description: `Node functionality added to your project`,
              duration: 5000,
            });
          }
          
          try {
            await updateIndexExportsInContainer(projectId, tasks.map(t => t.path));
          } catch (indexError: any) {
            console.error('Failed to update index exports:', indexError);
          }
        }
      }, 1000);
      
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);
    } catch (error: any) {
      console.error('Error in code injection:', error);
      
      if (setProjectContext) {
        console.log(`Removing ${nodeType} from injectingNodeTypes (error)`);
        setProjectContext(prev => {
          const updatedTypes = (prev.injectingNodeTypes || []).filter(type => type !== nodeType);
          console.log('Updated injectingNodeTypes after error:', updatedTypes);
          return {
            ...prev,
            injectingNodeTypes: updatedTypes
          };
        });
      }
      
      toast.error("Error", {
        description: `Failed to set up node functionality: ${error.message}`,
        duration: 5000,
      });
      throw error;
    }
  }
};

async function updatePackageJsonInContainer(projectId: string, dependencies: Record<string, string>): Promise<void> {
  try {
    console.log(`Updating package.json for project ${projectId} with dependencies:`, dependencies);
    
    const packagePath = "package.json";
    let response;
    
    try {
      console.log(`Attempting to get file content for ${packagePath}`);
      response = await containerFileApi.getFileContent(projectId, packagePath);
    } catch (error) {
      console.error(`Failed to find package.json at ${packagePath}`);
      throw error;
    }
    
    const checkPackageJson = async (taskId: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const taskData = await taskApi.getTask(taskId);
            console.log(`Package.json fetch task status: ${taskData.task.status}`);
            
            if (taskData.task.status === 'succeed' || taskData.task.status === 'finished') {
              clearInterval(pollInterval);
              resolve(taskData.task.result || '');
            } else if (taskData.task.status === 'failed') {
              clearInterval(pollInterval);
              reject(new Error(taskData.task.result));
            }
          } catch (error) {
            clearInterval(pollInterval);
            reject(error);
          }
        }, 1000);
        
        setTimeout(() => {
          clearInterval(pollInterval);
          reject(new Error('Timeout getting package.json'));
        }, 10000);
      });
    };
    
    const content = await checkPackageJson(response.taskId);
    console.log(`Package.json content retrieved from ${packagePath}`);
    
    const packageJson = JSON.parse(content);
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    let changed = false;
    
    for (const [name, version] of Object.entries(dependencies)) {
      if (!packageJson.dependencies[name]) {
        packageJson.dependencies[name] = version;
        changed = true;
      }
    }
    
    if (changed) {
      console.log(`Updating ${packagePath} with new dependencies`);
      await containerFileApi.updateFile(
        projectId,
        packagePath,
        JSON.stringify(packageJson, null, 2)
      );
      
      toast.info("Dependencies Added", {
        description: "Updated package.json with required dependencies",
        duration: 5000,
      });
    } else {
      console.log("No dependencies needed updating");
    }
  } catch (error) {
    console.error('Failed to update package.json:', error);
  }
}

async function updateIndexExportsInContainer(projectId: string, filePaths: string[]): Promise<void> {
  try {
    const indexPath = "src/index.ts";
    let indexContent = "";
    let response;
    
    try {
      response = await containerFileApi.getFileContent(projectId, indexPath);
      
      const checkTask = async (taskId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const pollInterval = setInterval(async () => {
            try {
              const taskData = await taskApi.getTask(taskId);
              if (taskData.task.status === 'succeed' || taskData.task.status === 'finished') {
                clearInterval(pollInterval);
                resolve(taskData.task.result || '');
              } else if (taskData.task.status === 'failed') {
                clearInterval(pollInterval);
                reject(new Error(taskData.task.result));
              }
            } catch (error) {
              clearInterval(pollInterval);
              reject(error);
            }
          }, 1000);
          
          setTimeout(() => {
            clearInterval(pollInterval);
            reject(new Error('Timeout getting index.ts'));
          }, 10000);
        });
      };
      
      indexContent = await checkTask(response.taskId);
      console.log(`Retrieved existing index.ts content`);
    } catch (error: any) {
      console.log(`No existing index.ts or error retrieving it: ${error.message}`);
      indexContent = "// Library exports\n\n";
    }
    
    const newExports = filePaths
      .filter(path => path.endsWith('.ts') || path.endsWith('.tsx'))
      .map(path => {
        const fileName = path.split('/').pop()!;
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        
        if (path.includes('src/components/')) {
          return `export * from "./components/${baseName}";`;
        } else if (path.includes('src/utils/')) {
          return `export * from "./utils/${baseName}";`;
        } else {
          return `export * from "./${path.replace('src/', '')}";`;
        }
      });
    
    let updatedContent = indexContent;
    let exportsAdded = false;
    
    for (const exportLine of newExports) {
      if (!indexContent.includes(exportLine)) {
        updatedContent += `${exportLine}\n`;
        exportsAdded = true;
      }
    }
    
    if (exportsAdded) {
      console.log(`Updating ${indexPath} with new exports`);
      await containerFileApi.updateFile(projectId, indexPath, updatedContent);
    } else {
      console.log(`No new exports needed for ${indexPath}`);
    }
  } catch (error) {
    console.error(`Failed to update index exports:`, error);
    throw error;
  }
} 