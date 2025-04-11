import { api } from './apiHelper';
import { 
  SaveProjectResponse, 
  ProjectContextToSave, 
  ListProjectsResponse,
  ProjectContextType,
} from '../context/project/ProjectContextTypes';
import { TaskResponse } from './interfaces/Task';

export const projectApi = {

  runCommand: async (
    command: string,
    cwd: string
  ): Promise<{
    message: string;
    command: string;
    cwd: string;
    taskId: string;
    output: string;
  }> => {
    try {
      const response = await api.post('/projects/run-command', { command, cwd });
      return response.data;
    } catch (error) {
      console.error('Error running command:', error);
      throw error;
    }
  },

  startContainer: async (projectId: string): Promise<{ message: string; taskId: string }> => {
    try {
      console.log(`[DEBUG_API] startContainer - Starting container for projectId: ${projectId}`);
      const response = await api.post(`/projects/${projectId}/start-container`);
      console.log(`[DEBUG_API] startContainer - Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[DEBUG_API] Error starting container:', error);
      throw error;
    }
  },

  async compileTs(tsFileName: string): Promise<{ jsContent: string; message: string }> {
    const response = await api.post('/projects/compile-ts', { tsFileName });
    return response.data;
  },

  createProject: async (
    projectInfo: ProjectContextToSave
  ): Promise<SaveProjectResponse> => {
    try {
      console.log(`[DEBUG_API] createProject - Creating project:`, {
        name: projectInfo.name,
        description: projectInfo.description ? projectInfo.description.substring(0, 20) + '...' : 'none'
      });
      const response = await api.post('/projects/create', projectInfo);
      console.log(`[DEBUG_API] createProject - Response:`, {
        message: response.data.message,
        projectId: response.data.project?.id,
        taskId: response.data.directoryTask?.taskId
      });
      return response.data;
    } catch (error) {
      console.error('[DEBUG_API] Error creating project:', error);
      throw error;
    }
  },

  createProjectDirectory: async (name: string, description: string): Promise<{ message: string; rootPath: string; taskId: string }> => {
    try {
      const response = await api.post(`/projects/create-project-directory`, { name, description });
      return response.data;
    } catch (error) {
      console.error('Error creating project directory:', error);
      throw error;
    }
  },

  updateProject: async (
    projectId: string,
    projectContext: ProjectContextToSave
  ): Promise<SaveProjectResponse> => {
    try {
      const response = await api.put(`/projects/update/${projectId}`, projectContext);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  listProjects: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ListProjectsResponse> => {
    try {
      const response = await api.get('/org/projects', {
        params: { page, limit, search },
      });
      return response.data.projects;
    } catch (error) {
      console.error('Error listing projects:', error);
      throw error;
    }
  },

  getProjectDetails: async (projectId: string): Promise<ProjectContextType> => {
    try {
      console.log(`[DEBUG_API] getProjectDetails - Fetching project details for ID: ${projectId}`);
      const response = await api.get(`/projects/details/${projectId}`);
      
      console.log(`[DEBUG_API] getProjectDetails - Raw API response status: ${response.status}, statusText: ${response.statusText}`);
      console.log(`[DEBUG_API] getProjectDetails - Raw API response data:`, response.data);
      
      if (response.data.project.container_url) {
        console.log(`[DEBUG_API] getProjectDetails - Found container_url: "${response.data.project.container_url}"`);
        response.data.project.containerUrl = response.data.project.container_url;
        delete response.data.project.container_url;
      } else if (response.data.project.containerUrl) {
        console.log(`[DEBUG_API] getProjectDetails - containerUrl already exists: "${response.data.project.containerUrl}"`);
      } else {
        console.log(`[DEBUG_API] getProjectDetails - No container_url or containerUrl found in response`);
      }
      
      console.log(`[DEBUG_API] getProjectDetails - Final project object with containerUrl: "${response.data.project.containerUrl || 'undefined'}"`);
      return response.data.project;
    } catch (error) {
      console.error('[DEBUG_API] Error getting project details:', error);
      throw error;
    }
  },

  getProjectRootPath: async (projectId: string): Promise<string> => {
    try {
      const response = await api.get(`/projects/root-path/${projectId}`);
      return response.data.rootPath;
    } catch (error) {
      console.error('Error getting project root path:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  runFunction: async (
    projectId: string, 
    functionName: string,
    parameters: any[],
    ephemeralPubkey?: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/run-script`, {
        functionName,
        parameters,
        ephemeralPubkey
      });
      return response.data;
    } catch (error) {
      console.error('Error running function:', error);
      throw error;
    }
  },

  initAnchorProject: async (
    projectId: string, 
    projectName: string,
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/init`, { projectId, projectName });
      return response.data;
    } catch (error) {
      console.error('Error initializing Anchor project:', error);
      throw error;
    }
  },

  setCluster: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/set-cluster`);
      return response.data;
    } catch (error) {
      console.error('Error setting cluster:', error);
      throw error;
    }
  },

  buildProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/build`);
      return response.data;
    } catch (error) {
      console.error('Error building project:', error);
      throw error;
    }
  },

  getBuildArtifact: async (projectId: string): Promise<{ status: string, base64So: string }> => {
    try {
      const response = await api.get(`/projects/${projectId}/build-artifact`);
      return response.data;
    } catch (error) {
      console.error('Error getting build artifact:', error);
      throw error;
    }
  },

  createEphemeral: async (projectId: string): Promise<{ ephemeralPubkey: string }> => {
    try {
      const response = await api.post(`/projects/${projectId}/ephemeral`);
      return response.data;
    } catch (err) {
      console.error('Error creating ephemeral:', err);
      throw err;
    }
  },

  deployProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/deploy`);
      return response.data;
    } catch (error) {
      console.error('Error deploying project:', error);
      throw error;
    }
  },

  deployProjectEphemeral: async (projectId: string, ephemeralPubkey: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/deploy-ephemeral`, {
        ephemeralPubkey
      });
      return response.data;
    } catch (error) {
      console.error('Error deploying project with ephemeral key:', error);
      throw error;
    }
  },

  runProjectCommand: async (
    projectId: string,
    commandType: 'anchor clean' | 'cargo clean'
  ): Promise<{ message: string; taskId: string }> => {
    try {
      const response = await api.post(`/projects/${projectId}/run-command`, {
        commandType,
      });
      return response.data;
    } catch (error) {
      console.error('Error running project command:', error);
      throw error;
    }
  },

  installPackages: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/install-packages`);
      return response.data;
    } catch (error) {
      console.error('Error installing npm packages:', error);
      throw error;
    }
  },

  installNodeDependencies: async (
    projectId: string,
    packages: string[]
  ): Promise<TaskResponse> => {
    try {
      console.log(`Installing dependencies for project ${projectId}:`);
      console.log(`Packages to install: ${JSON.stringify(packages)}`);
      
      const response = await api.post(
        `/projects/${projectId}/install-node-dependencies`,
        { packages }
      );
      
      console.log(`Install dependencies API response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error installing node dependencies:', error);
      throw error;
    }
  },

};
