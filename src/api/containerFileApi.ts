import { api } from './apiHelper';
import { TaskResponse } from './interfaces/Task';

export const containerFileApi = {
  createFile: async (
    projectId: string,
    relativePath: string,
    content: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(
        `/api/container/projects/${projectId}/files`,
        {
          filePath: relativePath,
          content
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating file in container:`, error);
      throw error;
    }
  },

  updateFile: async (
    projectId: string,
    relativePath: string,
    content: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.put(
        `/api/container/projects/${projectId}/files/${relativePath}`,
        {
          content
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating file in container:`, error);
      throw error;
    }
  },

  getFileContent: async (
    projectId: string,
    relativePath: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.get(
        `/api/container/projects/${projectId}/files/${relativePath}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting file content from container:`, error);
      throw error;
    }
  },

  installDependencies: async (
    projectId: string,
    packages: string[],
    targetDir: 'app' | 'server' = 'app'
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(
        `/api/container/projects/${projectId}/install`,
        {
          packages,
          targetDir
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error installing dependencies in container:`, error);
      throw error;
    }
  }
}; 