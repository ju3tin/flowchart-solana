"use client";

import React, { useState, useEffect } from "react";
import TaskLogsContext, { TaskLog, defaultSteps } from "./TaskLogsContext";

export default function TaskLogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'Initializing project with ID: 0x7F9A2C5B',
    'Loading configuration from blockchain.config.json',
    'Connecting to network: mainnet',
    'Processing...'
  ]);
  
  // Reset when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        // Auto-hide the toast after completion
        setIsVisible(false);
      }, 3000); // 3 seconds after completion
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Update current step based on progress
  useEffect(() => {
    // Calculate which step we're on based on progress (5 steps)
    const stepIndex = Math.min(Math.floor(progress / 20), defaultSteps.length - 1);
    setCurrentStep(stepIndex);
  }, [progress]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { message, timestamp: Date.now() },
    ]);
    
    // Make the toast visible when logs are added
    if (!isVisible) {
      setIsVisible(true);
    }
  };

  const addSystemLog = (log: string) => {
    setSystemLogs((prev) => [...prev, log]);
  };

  const resetLogs = () => {
    setLogs([]);
    setProgress(0);
    setCurrentStep(0);
    setSystemLogs([
      'Initializing project with ID: 0x7F9A2C5B',
      'Loading configuration from blockchain.config.json',
      'Connecting to network: mainnet',
      'Processing...'
    ]);
  };

  return (
    <TaskLogsContext.Provider
      value={{
        logs,
        isVisible,
        progress,
        currentStep,
        steps: defaultSteps,
        showDetails,
        systemLogs,
        memoryStats: "128MB / 512MB",
        networkStats: "4.2 MB/s",
        nodeVersion: "v18.12.1",
        
        addLog,
        setProgress,
        setCurrentStep,
        setIsVisible,
        setShowDetails,
        addSystemLog,
        resetLogs,
      }}
    >
      {children}
    </TaskLogsContext.Provider>
  );
} 