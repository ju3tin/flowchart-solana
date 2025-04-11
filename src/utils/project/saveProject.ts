import React from 'react';
import { ProjectContextType, ProjectStateType, ProjectContextToSave } from '../../context/project/ProjectContextTypes';
import { projectApi } from '../../api/projectApi';
import { SaveProjectResponse, savedKeys } from '../../context/project/ProjectContextTypes';
import { useTaskLogMonitoring } from '@/utils/logIntegration';

function pickProjectStateFields<K extends keyof ProjectStateType>(
  projectState: ProjectStateType,
  keys: K[],
): Pick<ProjectStateType, K> {
  const picked = {} as Pick<ProjectStateType, K>;
  for (const key of keys) {
    if (projectState[key] !== undefined) {
      picked[key] = projectState[key];
    }
  }
  return picked;
}

export function detailsToSave(project: ProjectContextType): ProjectContextToSave {
  const { id, name, description, details } = project;

  if (!details) {
    return {
      id,
      name,
      description,
      details: { projectState: {} },
    };
  }

  const filteredState = pickProjectStateFields(details.projectState, savedKeys);

  return {
    id,
    name,
    description,
    details: {
      projectState: filteredState,
    },
  };
}

let taskLogger: ReturnType<typeof useTaskLogMonitoring> | null = null;

export const saveProject = async (
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>
): Promise<SaveProjectResponse | null> => {

  const projectInfoToSave = detailsToSave(projectContext);
  console.log('projectInfoToSave', projectInfoToSave);

  if (!projectContext.id) {
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.__taskLogger) {
        taskLogger = w.__taskLogger;
        if (taskLogger) {
          taskLogger.startOperation("Project Creation");
          taskLogger.logMessage(`Creating new project: ${projectInfoToSave.name}`);
          taskLogger.updateProgress(10);
        }
      }
    }

    try {
      if (taskLogger) {
        taskLogger.logMessage("Sending project data to API...");
        taskLogger.updateProgress(30);
      }

      const response: SaveProjectResponse = await projectApi.createProject(projectInfoToSave);

      if (response.project?.id) {
        setProjectContext((prev) => ({
          ...prev,
          id: response.project.id,
          name: response.project.name,
          description: response.project.description,
        }));
        if (response.directoryTask && taskLogger) {
          const { taskId } = response.directoryTask;
          
          taskLogger.pollTaskStatus(
            taskId,
            "Project Directory Creation",
            (result) => {
              console.log(`Project directory creation completed with result: ${result}`);
            }
          );
        }
        
        if (response.directoryTaskError && taskLogger) {
          taskLogger.logError(`Directory creation failed: ${response.directoryTaskError}`);
        }

        return response;
      } else {
        console.error('Something went wrong');
        if (taskLogger) {
          taskLogger.logError("Failed to create project");
        }
        return null;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      if (taskLogger) {
        taskLogger.logError(`Error creating project: ${error}`);
      }
      return null;
    }
  }

  if (projectContext.id) {
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.__taskLogger) {
        taskLogger = w.__taskLogger;
        if (taskLogger) {
          taskLogger.startOperation("Project Update");
          taskLogger.logMessage(`Updating project: ${projectInfoToSave.name}`);
          taskLogger.updateProgress(50);
        }
      }
    }

    try {
      const response = await projectApi.updateProject(projectContext.id, projectInfoToSave);
      if (response.message === 'Project updated successfully') {
        setProjectContext((prev) => ({
          ...prev,
          details: {
            ...prev.details!,
            projectState: prev.details!.projectState,
          },
        }));
        console.log('Updated project on database', response);
        if (taskLogger) taskLogger.completeOperation("Project updated successfully");
        return response;
      } else {
        console.error('Something went wrong');
        if (taskLogger) {
          taskLogger.logError("Failed to update project");
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating project:', error);
      if (taskLogger) {
        taskLogger.logError(`Error updating project: ${error}`);
      }
      return null;
    }
  }

  return null;
};