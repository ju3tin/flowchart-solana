import React from "react";
import { toast } from "sonner";
import { projectApi } from "@/api/projectApi";
import { ProjectContextType, ProjectStateUpdater } from "@/context/project/ProjectContextTypes";
import { saveProject } from "./saveProject";
import { fetchFilesAndCodes } from "@/utils/codeGeneration/fetchFilesAndCodes";
import { FileTreeItemType } from "@/interfaces/FileTreeItemType";
import { UxOpenPanel } from "@/context/ux/UxContextTypes";
import { pollTaskStatus4 } from "@/utils/task/taskUtils";

export const fetchProjects = async (
    page: number, 
    search: string, 
    setProjects: (projects: any[]) => void, 
    setTotalPages: (totalPages: number) => void, 
    setLoading: (loading: boolean) => void, 
    setError: (error: string | null) => void,
    limit = 3 
) => {
    setLoading(true);
    setError(null);

    try {
      const { data, totalPages } = await projectApi.listProjects(page, limit, search);
      console.log("data", data);
      console.log("totalPages", totalPages);

      setProjects(data);
      setTotalPages(totalPages);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
};

export function getSafeProjectContext(
  fetched: Partial<ProjectContextType>,
  setProjectState: (stateUpdater: ProjectStateUpdater) => void
): ProjectContextType {
  return {
    id: fetched.id || "",
    name: fetched.name || "",
    description: fetched.description || "",
    containerUrl: fetched.containerUrl || "",
    injectingNodeTypes: fetched.injectingNodeTypes || [],
    details: {
      ...fetched.details,
      setProjectState:
        setProjectState || (() => {}), 
      projectState: {
        // If there's no projectState in the DB, or partial projectState, fill in defaults
        mode: fetched.details?.projectState?.mode || "basic",
        nodes: fetched.details?.projectState?.nodes || [],
        edges: fetched.details?.projectState?.edges || [],
        config: fetched.details?.projectState?.config || {},
        instructions: fetched.details?.projectState?.instructions || [],
        projectFiles: fetched.details?.projectState?.projectFiles || { lib: "", mod: "", state: "" },
        fileTree: fetched.details?.projectState?.fileTree || undefined,
        programId: fetched.details?.projectState?.programId || '',
      }
    }
  };
}

export const handleOpenProject = async (
  projectId: string,
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  setFileTree: (tree: FileTreeItemType | null) => void
) => {
  try {
    console.log(`[DEBUG] handleOpenProject - Starting for projectId: ${projectId}`);
    console.log(`[DEBUG] Current projectContext before API call:`, projectContext);
    
    const fetchedDetails = await projectApi.getProjectDetails(projectId);
    console.log(`[DEBUG] fetchedDetails from API:`, fetchedDetails);
    console.log(`[DEBUG] fetchedDetails.containerUrl:`, fetchedDetails.containerUrl);

    // Merge DB data with local context shape
    const safeProjectContext = getSafeProjectContext(
      fetchedDetails,
      projectContext.details?.setProjectState || (() => {})
    );
    
    console.log(`[DEBUG] safeProjectContext after getSafeProjectContext:`, safeProjectContext);
    console.log(`[DEBUG] safeProjectContext.containerUrl:`, safeProjectContext.containerUrl);

    setProjectContext(safeProjectContext);
    console.log(`[DEBUG] Project context set with safeProjectContext`);

    if (!fetchedDetails.details?.projectState?.fileTree) {
      setFileTree(null);
    } else {
      // Explicitly set afterCodeGen to false to prevent code generation during project loading
      fetchFilesAndCodes(projectId, safeProjectContext, setProjectContext, setFileTree, false);
    }

    // Start container to ensure the CRA dev server is running
    try {
      const containerResult = await projectApi.startContainer(projectId);
      console.log('Container start task initiated:', containerResult.taskId);
    } catch (containerError) {
      console.error('Error starting container:', containerError);
      // Don't fail the whole open project operation if container start fails
    }
  } catch (err) {
    console.error("Error opening project:", err);
  }
};

export const handleDeleteProject = async (
  projectId: string, 
  page: number, 
  search: string, 
  setProjects: (projects: any[]) => void, 
  setTotalPages: (totalPages: number) => void, 
  setLoading: (loading: boolean) => void, 
  setError: (error: string | null) => void,
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  setFileTree: (fileTree: FileTreeItemType | null) => void,
  setSelectedFile: (file: FileTreeItemType | null) => void
) => {
  try {
    // Show initial toast about the deletion process starting
    const loadingToast = toast.loading("Deleting Project", {
      description: "Deleting project and cleaning up resources..."
    });
    
    // Delete project and get the task ID for container removal
    const response = await projectApi.deleteProject(projectId);
    
    if (response.containerTaskId) {
      try {
        // Poll for container removal task completion
        const taskStatus = await pollTaskStatus4(response.containerTaskId);
        // Close the loading toast
        toast.dismiss(loadingToast);
        
        if (taskStatus === 'succeed' || taskStatus === 'finished') {
          // Re-fetch the list to update UI
          await fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
          
          // If user has just deleted the project they had open, reset both ProjectContext and FileContext
          if (projectContext.id === projectId) {
            setProjectContext((prevCtx) => ({
              ...prevCtx,
              id: "",
              name: "",
              description: "",
              details: {
                ...prevCtx.details,
                setProjectState: prevCtx.details?.setProjectState || (() => {}),
                projectState: {
                  mode: "basic",
                  nodes: [],
                  edges: [],
                  config: {},
                  instructions: [],
                  projectFiles: { lib: "", mod: "", state: "" },
                  fileTree: undefined,
                  built: false,
                  deployed: false,
                },
              },
            }));

            // Reset the file context here as well
            setFileTree(null);
            setSelectedFile(null);
          }
          
          toast("Project Deleted", {
            description: "The project was successfully deleted.",
            style: { backgroundColor: "#4ade80", color: "white" }
          });
        } else if (taskStatus === 'warning') {
          toast("Project Partially Deleted", {
            description: "Project was deleted but there may be issues with cleanup.",
            style: { backgroundColor: "#f87171", color: "white" }
          });
          await fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
        } else if (taskStatus === 'failed') {
          toast("Project Deletion Issue", {
            description: "Project record was deleted but container cleanup failed.",
            style: { backgroundColor: "#f87171", color: "white" }
          });
          await fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
        }
      } catch (pollError: unknown) {
        // Close the loading toast
        toast.dismiss(loadingToast);
        console.error("Error polling container removal task:", pollError);
        
        // Check if pollError has a response property with a status of 404
        const isTaskNotFoundError = 
          pollError && 
          typeof pollError === 'object' && 
          pollError !== null &&
          'response' in pollError && 
          pollError.response && 
          typeof pollError.response === 'object' &&
          'status' in pollError.response &&
          pollError.response.status === 404;

        // This is actually a success case, as the task was created and the project was deleted.
        if (isTaskNotFoundError) {
          toast("Project Deleted", {
            description: "Project was successfully deleted and resources cleaned up.",
            style: { backgroundColor: "#4ade80", color: "white" }
          });
        } else {
          toast("Project Deletion Status Unknown", {
            description: "Project may have been deleted, but we couldn't confirm resource cleanup.",
            style: { backgroundColor: "#f87171", color: "white" }
          });
        }
        
        // Always refresh the project list regardless of error type
        await fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
        
        // If user has just deleted the project they had open, reset contexts
        if (projectContext.id === projectId) {
          setProjectContext((prevCtx) => ({
            ...prevCtx,
            id: "",
            name: "",
            description: "",
            details: {
              ...prevCtx.details,
              setProjectState: prevCtx.details?.setProjectState || (() => {}),
              projectState: {
                mode: "basic",
                nodes: [],
                edges: [],
                config: {},
                instructions: [],
                projectFiles: { lib: "", mod: "", state: "" },
                fileTree: undefined,
                built: false,
                deployed: false,
              },
            },
          }));

          setFileTree(null);
          setSelectedFile(null);
        }
      }
    } else {
      // No container task ID was returned
      toast.dismiss(loadingToast);
      await fetchProjects(page, search, setProjects, setTotalPages, setLoading, setError);
      
      // Still reset project context if needed
      if (projectContext.id === projectId) {
        setProjectContext((prevCtx) => ({
          ...prevCtx,
          id: "",
          name: "",
          description: "",
          details: {
            ...prevCtx.details,
            setProjectState: prevCtx.details?.setProjectState || (() => {}),
            projectState: {
              mode: "basic",
              nodes: [],
              edges: [],
              config: {},
              instructions: [],
              projectFiles: { lib: "", mod: "", state: "" },
              fileTree: undefined,
              built: false,
              deployed: false,
            },
          },
        }));

        setFileTree(null);
        setSelectedFile(null);
      }
      
      toast("Project Deleted", {
        description: "The project was successfully deleted.",
        style: { backgroundColor: "#4ade80", color: "white" }
      });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    toast("Error Deleting Project", {
      description: "Failed to delete project. Please try again.",
      style: { backgroundColor: "#f87171", color: "white" }
    });
  }
};

export const handleProjectClick = async (
  projectId: string, 
  projectName: string,
  onProjectClick: (projectId: string, projectName: string) => void,
  closePopover: () => void
) => {
  onProjectClick(projectId, projectName);
  closePopover();
};

export const handleNewProjectClick = (
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  projectContext: ProjectContextType,
  setFileTree: (fileTree: FileTreeItemType | null) => void,
  setSelectedFile?: (file: FileTreeItemType | null) => void,
  setIsCodeReady?: (isCodeReady: boolean) => void
) => {
  setProjectContext({
    id: '',
    name: '',
    description: '',
    details: {
      setProjectState: projectContext.details?.setProjectState || (() => {}),
      projectState: {
        mode: 'basic',
        nodes: [],
        edges: [],
        config: {},
        programId: '',
        instructions: [],
        projectFiles: { lib: '', mod: '', state: '' },
        fileTree: undefined,
      },
    },
  });

  setFileTree(null);
  if (setSelectedFile) setSelectedFile(null);
  if (setIsCodeReady) setIsCodeReady(false);
  localStorage.removeItem('projectContext');
};

export const handleConfirmNewProject = async (
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  localProjectName: string,
  localProjectDescription: string,
  projectsRefreshCounter: number,
  setProjectsRefreshCounter: (n: number) => void,
  setUxOpenPanel: (panel: UxOpenPanel) => void,
  setFileTree: (tree: FileTreeItemType | null) => void,
  setSelectedFile: (file: FileTreeItemType | null) => void
) => {
  console.log(`[DEBUG_PROJECT_CONFIRM] Starting handleConfirmNewProject for project name=${localProjectName}`);
  const newContext: ProjectContextType = {
    id: "", 
    name: localProjectName,
    description: localProjectDescription,
    details: {
      setProjectState: projectContext.details?.setProjectState || (() => {}),
      projectState: {
        mode: "basic",
        nodes: [],
        edges: [],
        config: {},
        instructions: [],
        projectFiles: { lib: "", mod: "", state: "" },
        fileTree: undefined,
      },
    },
  };

  setProjectContext(newContext);
  setFileTree(null);
  setSelectedFile(null);
  
  // Save the new project to the backend
  try {
    const saved = await saveProject(newContext, setProjectContext);
    console.log("New project created:", saved);
    setProjectsRefreshCounter(projectsRefreshCounter + 1);
  } catch (error) {
    console.error("Failed to create new project:", error);
  }
};

export const handleSaveClick = async (
  projectContext: ProjectContextType,
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>,
  projectsRefreshCounter: number,
  setProjectsRefreshCounter: (n: number) => void
) => {
    try {
      await toast.promise(
        saveProject(projectContext, setProjectContext),
        {
          loading: "Saving project...",
          success: "Project updated successfully",
          error: "Failed to update project"
        }
      );
      setProjectsRefreshCounter(projectsRefreshCounter + 1);
    } catch (err) {
      console.error("Error saving project:", err);
  }
};