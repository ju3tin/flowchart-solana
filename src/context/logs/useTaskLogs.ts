"use client";

import { useContext } from 'react';
import TaskLogsContext, { TaskLogsContextType } from './TaskLogsContext';

export function useTaskLogs(): TaskLogsContextType {
  const context = useContext(TaskLogsContext);
  
  if (!context) {
    throw new Error('useTaskLogs must be used within a TaskLogsProvider');
  }
  
  return context;
} 