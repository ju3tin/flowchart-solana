"use client";

import { useEffect, useRef } from 'react';
import { useTaskLogs } from '@/context/logs/useTaskLogs';

// This hook integrates real logs into the TaskLogs UI
export function useLogsIntegration(
  operation?: string | null,
  active?: boolean,
  logs?: string[] | null
) {
  const { 
    addLog, 
    resetLogs, 
    setProgress, 
    setIsVisible, 
    addSystemLog 
  } = useTaskLogs();
  
  const operationRef = useRef(operation);
  const lastLogRef = useRef('');
  const progressRef = useRef(0);
  
  // When operation changes, reset logs
  useEffect(() => {
    if (operation !== operationRef.current) {
      resetLogs();
      progressRef.current = 0;
      
      if (operation) {
        setIsVisible(true);
        addLog(`Starting ${operation}`);
        addSystemLog(`Starting ${operation}`);
      } else {
        setIsVisible(false);
      }
      
      operationRef.current = operation;
    }
  }, [operation, addLog, resetLogs, setIsVisible, addSystemLog]);
  
  // When logs change, update UI
  useEffect(() => {
    if (!active || !logs?.length) return;
    
    // Find new logs
    const lastLog = logs[logs.length - 1];
    if (lastLog && lastLog !== lastLogRef.current) {
      addLog(lastLog);
      addSystemLog(lastLog);
      lastLogRef.current = lastLog;
      
      // Increment progress when new logs come in
      progressRef.current += 10;
      if (progressRef.current > 95) {
        progressRef.current = 95; // Cap at 95% until completion
      }
      setProgress(progressRef.current);
    }
  }, [logs, active, addLog, addSystemLog, setProgress]);
  
  // Complete function for when operation is done
  const completeOperation = () => {
    if (!operationRef.current) return;
    
    addLog(`${operationRef.current} completed successfully`);
    addSystemLog(`${operationRef.current} completed successfully`);
    setProgress(100);
    operationRef.current = null;
  };
  
  // Error function for when operation fails
  const errorOperation = (error: string) => {
    if (!operationRef.current) return;
    
    addLog(`Error: ${error}`);
    addSystemLog(`Error: ${error}`);
    setProgress(100);
    operationRef.current = null;
  };
  
  return {
    completeOperation,
    errorOperation
  };
} 