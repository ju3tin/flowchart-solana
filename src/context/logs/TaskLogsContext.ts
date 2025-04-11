import { createContext } from 'react';

export interface TaskLog {
  message: string;
  timestamp: number;
}

export interface TaskLogsContextType {
  logs: TaskLog[];
  isVisible: boolean;
  progress: number;
  currentStep: number;
  steps: {
    icon: string;
    message: string;
    details: string;
  }[];
  showDetails: boolean;
  systemLogs: string[];
  memoryStats: string;
  networkStats: string;
  nodeVersion: string;
  
  addLog: (message: string) => void;
  setProgress: (progress: number) => void;
  setCurrentStep: (step: number) => void;
  setIsVisible: (isVisible: boolean) => void;
  setShowDetails: (showDetails: boolean) => void;
  addSystemLog: (log: string) => void;
  resetLogs: () => void;
}

const defaultSteps = [
  {
    icon: 'Server',
    message: "Initializing project environment...",
    details: "Setting up project directory structure and configuration files",
  },
  {
    icon: 'Database',
    message: "Configuring blockchain connections...",
    details: "Establishing secure connections to the blockchain network",
  },
  {
    icon: 'Code',
    message: "Generating smart contract templates...",
    details: "Creating optimized contract templates with security best practices",
  },
  {
    icon: 'Cpu',
    message: "Initializing virtual machine...",
    details: "Setting up EVM compatibility layer for contract testing",
  },
  {
    icon: 'HardDrive',
    message: "Syncing with latest blockchain state...",
    details: "Downloading and verifying latest block headers",
  }
];

const TaskLogsContext = createContext<TaskLogsContextType>({
  logs: [],
  isVisible: false,
  progress: 0,
  currentStep: 0,
  steps: defaultSteps,
  showDetails: false,
  systemLogs: [],
  memoryStats: "128MB / 512MB",
  networkStats: "4.2 MB/s",
  nodeVersion: "v18.12.1",
  
  addLog: () => {},
  setProgress: () => {},
  setCurrentStep: () => {},
  setIsVisible: () => {},
  setShowDetails: () => {},
  addSystemLog: () => {},
  resetLogs: () => {},
});

export { defaultSteps };
export default TaskLogsContext; 