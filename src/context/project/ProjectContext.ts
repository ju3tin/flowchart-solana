import React,{ createContext } from 'react'
import { ProjectContextType } from './ProjectContextTypes'

export interface IProjectContextValue {
  projectContext: ProjectContextType
  setProjectContext: React.Dispatch<React.SetStateAction<ProjectContextType>>
}

const defaultValue: IProjectContextValue = {
  // Default (initial) project context
  projectContext: {
    id: '',
    name: '',
    description: '',
    containerUrl: '',
    injectingNodeTypes: [],
    details: {
      projectState: {
        mode: 'basic',
        nodes: [],
        edges: [],
        config: {},
        instructions: [],
        projectFiles: { lib: '', mod: '', state: '' },
        fileTree: undefined,
      },
      setProjectState: () => {},
    },
  },
  setProjectContext: () => {},
}

const ProjectContext = createContext<IProjectContextValue>(defaultValue)

export default ProjectContext
