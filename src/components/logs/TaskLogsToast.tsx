"use client";

import React from "react";
import { Loader2, CheckCircle2, Terminal, Server, Database, Code, Cpu, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskLogs } from "@/context/logs/useTaskLogs";

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server className="h-4 w-4" />,
  Database: <Database className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
  HardDrive: <HardDrive className="h-4 w-4" />,
};

export default function TaskLogsToast() {
  const {
    isVisible,
    progress,
    currentStep,
    steps,
    showDetails,
    setShowDetails,
    systemLogs,
    memoryStats,
    networkStats,
    nodeVersion,
  } = useTaskLogs();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-120 w-96 bg-[#0A0B10]/95 border border-[#1A1B25] rounded-lg shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Header with hexagon pattern background */}
      <div className="relative h-12 bg-gradient-to-r from-[#0E0F17] to-[#151823] flex items-center px-4">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 border border-white/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: "rotate(45deg)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2 z-10">
          <div className="h-6 w-6 rounded-full bg-[#0A0B10] flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          </div>
          <h3 className="font-medium text-sm">Project Setup</h3>
        </div>
        <div className="ml-auto flex items-center space-x-1 z-10">
          <div className="text-xs font-mono text-blue-300">{Math.round(progress)}%</div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-[#1A1B25]">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="p-4">
        <div className="text-sm text-gray-300 mb-3">
          Your project directory is being created. This operation involves multiple steps and may take a moment.
        </div>

        {/* Status logs */}
        <div className="space-y-2 mb-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 py-1.5 px-2 rounded transition-colors",
                index === currentStep ? "bg-[#0E1018]/80" : "",
                index < currentStep ? "text-gray-400" : "text-gray-500",
              )}
            >
              <div className="mt-0.5">
                {index < currentStep ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : index === currentStep ? (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  {iconMap[step.icon]}
                  <span className="ml-2 text-xs font-medium">{step.message}</span>
                </div>

                {showDetails && index <= currentStep && (
                  <div className="mt-1 text-xs text-gray-500 pl-6">{step.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Technical details */}
        <div className="bg-[#050508] rounded border border-[#1A1B25] p-2 mt-3">
          <div className="flex items-center mb-1">
            <Terminal className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <span className="text-xs text-gray-400 font-medium">System Log</span>
          </div>
          <div className="font-mono text-xs text-gray-500 max-h-20 overflow-y-auto">
            {systemLogs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-blue-500 mr-2">$</span>
                {index === systemLogs.length - 1 ? (
                  <span className="text-gray-400 animate-pulse">
                    {log} <span className="inline-block w-1 h-3 bg-gray-400 animate-blink"></span>
                  </span>
                ) : (
                  <span>
                    {log.includes(':') ? (
                      <>
                        {log.split(':')[0]}:
                        <span className={
                          log.includes('ID') || log.includes('id') ? 'text-green-500' :
                          log.includes('config') || log.includes('json') ? 'text-yellow-500' : 
                          log.includes('network') || log.includes('mainnet') ? 'text-purple-500' : ''
                        }>
                          {log.split(':').slice(1).join(':')}
                        </span>
                      </>
                    ) : (
                      log
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with technical stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-[#1A1B25] pt-3">
          <div>
            <div className="text-gray-500">Memory</div>
            <div className="font-mono text-gray-300">{memoryStats}</div>
          </div>
          <div>
            <div className="text-gray-500">Network</div>
            <div className="font-mono text-gray-300">{networkStats}</div>
          </div>
          <div>
            <div className="text-gray-500">Node</div>
            <div className="font-mono text-gray-300">{nodeVersion}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 