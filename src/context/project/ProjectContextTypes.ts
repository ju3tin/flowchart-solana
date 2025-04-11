import { FileTreeItemType } from "@/interfaces/FileTreeItemType";

export interface InstructionType {
  label: string;
  context: { label: string; value: string }[];
  inputs: { label: string; value: string }[];
  outputs: { label: string; value: string }[];
  code: string;
}

export interface ProjectFileType {
  lib: string;
  mod: string;
  state: string;
}

export type ProjectStateUpdater =
  | ProjectStateType
  | ((prevState: ProjectStateType) => ProjectStateType);

export interface ProjectStateType {
  mode: "basic" | "advanced";
  nodes: any[];
  edges: any[]; 
  config: any; 
  programId?: string;
  instructions?: InstructionType[];
  projectFiles?: any;
  fileTree?: FileTreeItemType;
  deployed?: boolean;
}

export interface ProjectDetailsType {
  projectState: ProjectStateType;
  setProjectState: (stateUpdater: ProjectStateUpdater) => void;
}

export interface ProjectContextType {
  id?: string;
  name?: string;
  description?: string;
  containerUrl?: string;
  details?: ProjectDetailsType;
  injectingNodeTypes?: string[];
}

// ----------- Save Project -----------
export interface ProjectContextToSave {
  id?: string;
  name?: string;
  description?: string;
  containerUrl?: string;
  details?: {
    projectState: Partial<ProjectStateType>;
  };
}

export interface SaveProjectResponse {
  message: string;
  project: {
    id: string;
    name: string;
    description: string;
    org_id: string;
    root_path: string;
    details: any;
    last_updated: string;
    created_at: string;
  };
  directoryTask?: {
    taskId: string;
    message: string;
  };
  directoryTaskError?: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_updated: string;
  root_path: string;
}

export interface ListProjectsResponse {
  data: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const savedKeys: (keyof ProjectStateType)[] = [
    'nodes',
    'edges',
    'config',
    'programId',
    'instructions',
    'projectFiles',
    'fileTree',
    'deployed',
];