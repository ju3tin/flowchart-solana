"use client";

import { useEffect } from 'react';
import { useTaskLogMonitoring } from '@/utils/logIntegration';

// This hook initializes the global task logger
export default function useInitializeTaskLogger() {
  const taskLogger = useTaskLogMonitoring();
  
  useEffect(() => {
    // Attach the logger to the window object for non-component access
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__taskLogger = taskLogger;
    }
    
    return () => {
      // Clean up when the component unmounts
      if (typeof window !== 'undefined') {
        const w = window as any;
        if (w.__taskLogger === taskLogger) {
          delete w.__taskLogger;
        }
      }
    };
  }, [taskLogger]);
  
  return taskLogger;
} 