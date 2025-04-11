"use client";

import { useTaskLogs } from "@/context/logs/useTaskLogs";
import { taskApi } from "@/api/taskApi";

export function extractTaskLogs(taskResult: any): string[] {
  if (!taskResult) return [];
  
  if (taskResult.taskId) {
    return [`Task started with ID: ${taskResult.taskId}`];
  }
  
  if (taskResult.message) {
    return [taskResult.message];
  }
  
  return [];
}

export function updateTaskLogsFromPolling(taskStatus: string, taskDetails: string): string[] {
  const logs: string[] = [];
  
  if (taskStatus === 'doing') {
    logs.push('Task in progress...');
    
    if (taskDetails && taskDetails.includes('\n')) {
      const detailLines = taskDetails.split('\n').filter(Boolean);
      logs.push(...detailLines);
    } else if (taskDetails) {
      logs.push(taskDetails);
    }
  }
  else if (taskStatus === 'succeed' || taskStatus === 'finished') {
    logs.push('Task completed successfully');
    if (taskDetails) logs.push(taskDetails);
  }
  else if (taskStatus === 'failed') {
    logs.push('Task failed');
    if (taskDetails) logs.push(`Error: ${taskDetails}`);
  }
  else if (taskStatus === 'warning') {
    logs.push('Task completed with warnings');
    if (taskDetails) logs.push(`Warning: ${taskDetails}`);
  }
  
  return logs;
}

interface TaskLogger {
  startOperation: (operationName: string) => void;
  updateProgress: (percent: number) => void;
  logMessage: (message: string) => void;
  completeOperation: (message?: string) => void;
  logError: (error: string) => void;
}

export function pollTaskStatus(
  taskId: string,
  operationName: string,
  logger: TaskLogger,
  onCompleted?: (result: string) => void
) {
  if (!logger) return;
  
  logger.logMessage(`${operationName} started with task ID: ${taskId}`);
  logger.updateProgress(50);
  
  const pollInterval = setInterval(async () => {
    try {
      const { task } = await taskApi.getTask(taskId);
      
      if (task.status === 'doing') {
        if (task.result && !task.result.includes('Error')) {
          logger.logMessage(task.result);
          logger.updateProgress(70);
        }
      }
      else if (task.status === 'succeed' || task.status === 'finished') {
        const successMessage = `${operationName} completed successfully.`;
        logger.logMessage(successMessage);
        logger.completeOperation(successMessage);
        clearInterval(pollInterval);
        
        if (onCompleted && task.result) {
          onCompleted(task.result);
        }
      }
      else if (task.status === 'failed' || task.status === 'warning') {
        const message = `${operationName} ${task.status === 'warning' ? 'completed with warnings' : 'failed'}: ${task.result || 'No details available'}`;
        logger.logError(message);
        clearInterval(pollInterval);
      }
    } catch (err) {
      console.error(`Error polling ${operationName} task:`, err);
      logger.logError(`Error tracking ${operationName} status`);
      clearInterval(pollInterval);
    }
  }, 3000);
  
  return () => clearInterval(pollInterval);
}

export function useTaskLogMonitoring() {
  const { 
    resetLogs, 
    setIsVisible, 
    addLog, 
    addSystemLog, 
    setProgress 
  } = useTaskLogs();
  
  const startOperation = (operationName: string) => {
    resetLogs();
    setIsVisible(true);
    setProgress(5);
    addLog(`Starting ${operationName}...`);
    addSystemLog(`Starting ${operationName}...`);
  };
  
  const updateProgress = (percent: number) => {
    setProgress(Math.min(percent, 95));
  };
  
  const logMessage = (message: string) => {
    addLog(message);
    addSystemLog(message);
  };
  
  const completeOperation = (message?: string) => {
    if (message) {
      addLog(message);
      addSystemLog(message);
    }
    setProgress(100);
  };
  
  const logError = (error: string) => {
    addLog(`Error: ${error}`);
    addSystemLog(`Error: ${error}`);
    setProgress(100);
  };
  
  const logger: TaskLogger = {
    startOperation,
    updateProgress,
    logMessage,
    completeOperation,
    logError
  };
  
  return {
    startOperation,
    updateProgress,
    logMessage,
    completeOperation,
    logError,
    pollTaskStatus: (
      taskId: string, 
      operationName: string, 
      onCompleted?: (result: string) => void
    ) => pollTaskStatus(taskId, operationName, logger, onCompleted)
  };
} 