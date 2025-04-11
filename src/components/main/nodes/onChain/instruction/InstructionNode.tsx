import React, { useContext, useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";

// Styles
import './style/instructionStyle.css';
import "@/styles/nodes/basicNodeStyle.css";

// Icons
import { ChevronDown, ChevronRight, Check, Key, Database, Edit2, Copy, Shield, XCircle, Zap, Cpu, Hash, Text } from "lucide-react";

interface FileInfo {
  name: string;
  ext: string;
  type: string;
  code?: string;
  path: string;
}

interface ProjectContextType {
  setActiveTab: (tab: string) => void;
  setSelectedFile: (file: FileInfo) => void;
}

// Account types
interface Account {
  label: string;
  type: string;
  description?: string;
  info?: any;
  isWritable?: boolean;
  isSigner?: boolean;
}

// Parameter types
interface Parameter {
  label: string;
  type: string;
  value?: string;
}

// Error code types
interface ErrorCode {
  name: string;
  message: string;
}

// Event types
interface Event {
  name: string;
  type?: string;
  description: string;
  fields?: Array<{ name: string; type: string }>;
}

interface InstructionGroupNodeData {
  label: string;
  description?: string;
  accounts?: Account[];
  parameters?: Parameter[];
  errorCodes?: ErrorCode[];
  events?: Event[];
  code?: string;
}

// We assume these modules exist elsewhere in the project
const ProjectContext = React.createContext<ProjectContextType>({} as ProjectContextType);

// This function is imported from a utility file, defining it here as a fallback
const pascalToSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

// Account Section Component
const AccountSection = ({ account }: { account: Account }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [publicKey, setPublicKey] = useState("11111111111111111111111111111111");
  const [isEditingPublicKey, setIsEditingPublicKey] = useState(false);
  const [owner, setOwner] = useState("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [lamports, setLamports] = useState("0.01000000");
  const [isEditingLamports, setIsEditingLamports] = useState(false);
  const [rentEpoch, setRentEpoch] = useState("123");
  const [isEditingRentEpoch, setIsEditingRentEpoch] = useState(false);

  const publicKeyInputRef = useRef<HTMLInputElement>(null);
  const ownerInputRef = useRef<HTMLInputElement>(null);
  const lamportsInputRef = useRef<HTMLInputElement>(null);
  const rentEpochInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingPublicKey && publicKeyInputRef.current) {
      publicKeyInputRef.current.focus();
    }
  }, [isEditingPublicKey]);

  useEffect(() => {
    if (isEditingOwner && ownerInputRef.current) {
      ownerInputRef.current.focus();
    }
  }, [isEditingOwner]);

  useEffect(() => {
    if (isEditingLamports && lamportsInputRef.current) {
      lamportsInputRef.current.focus();
    }
  }, [isEditingLamports]);

  useEffect(() => {
    if (isEditingRentEpoch && rentEpochInputRef.current) {
      rentEpochInputRef.current.focus();
    }
  }, [isEditingRentEpoch]);

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
  };

  const handleCopyOwner = () => {
    navigator.clipboard.writeText(owner);
  };

  const isWritable = account.isWritable || false;
  const isSigner = account.isSigner || false;
  const isProgramId = account.type === "Program";
  const description = account.description || "";

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center mb-1 group relative">
        <div className="flex items-center cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[#5d5dff] mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#5d5dff] mr-1" />
          )}

          <span className={`text-sm text-[#e1e2e6]`}>
            {account.label}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Account Type Badges */}
          {account.type === "AccountInfo" && (
            <span className="text-[8px] bg-[#121218] px-1.5 py-0.5 rounded border border-gray-500 text-gray-500">
              AccountInfo
            </span>
          )}
          {account.type === "Program" && (
            <span className="text-[8px] bg-[#121218] px-1.5 py-0.5 rounded border border-[#5d5dff] text-[#5d5dff]">
              Program
            </span>
          )}
          {account.type === "Sysvar" && (
            <span className="text-[8px] bg-[#121218] px-1.5 py-0.5 rounded border border-[#d69e2e] text-[#d69e2e]">
              Sysvar
            </span>
          )}
          {!account.type && (
            <span className="text-[8px] bg-[#121218] px-1.5 py-0.5 rounded border border-[#888] text-[#888]">
              Unknown
            </span>
          )}

          {/* Account Properties */}
          {isSigner && (
            <span className="text-[8px] bg-[#121218] text-[#36b37e] px-1.5 py-0.5 rounded border border-[#36b37e]">
              Signer
            </span>
          )}
          {isWritable && (
            <span className="text-[8px] bg-[#121218] text-[#36b37e] px-1.5 py-0.5 rounded border border-[#36b37e]">
              Writable
            </span>
          )}
        </div>
      </div>

      {description && !isExpanded && (
        <div className="flex items-center ml-5 group">
          <p className="text-xs text-[#888] font-sans flex-1">{description}</p>
        </div>
      )}

      {isExpanded && (
        <div className="ml-5 mt-2 space-y-3">
          {description && (
            <div className="flex items-center group">
              <p className="text-xs text-[#888] font-sans flex-1">{description}</p>
            </div>
          )}

          {/* Public Key */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="h-3 w-3 text-[#5d5dff] mr-1" />
                <span className="text-xs text-[#5d5dff]">Public Key</span>
              </div>
              <span className="text-xs bg-[#121218] px-1.5 py-0.5 rounded-sm border border-[#333]">Address</span>
            </div>
            <div className="bg-[#1a1a24] p-1.5 rounded text-xs font-mono border border-[#333] text-[#e1e2e6] relative overflow-hidden group editable-field">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5d5dff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"
              ></div>

              {isEditingPublicKey ? (
                <input
                  ref={publicKeyInputRef}
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  onBlur={() => setIsEditingPublicKey(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingPublicKey(false)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#5d5dff] text-white editable-input"
                />
              ) : (
                <>
                  {publicKey}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleCopyPublicKey} className="p-0.5 rounded hover:bg-[#333]">
                      <Copy className="h-3 w-3 text-[#888] hover:text-white" />
                    </button>
                    <button onClick={() => setIsEditingPublicKey(true)} className="p-0.5 rounded hover:bg-[#333] edit-button">
                      <Edit2 className="h-3 w-3 text-[#888] hover:text-[#5d5dff]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Owner */}
          {!isProgramId && (
            <div className="space-y-1">
              <div className="flex items-center">
                <Database className="h-3 w-3 text-[#5d5dff] mr-1" />
                <span className="text-xs text-[#5d5dff]">Owner</span>
              </div>
              <div className="bg-[#1a1a24] p-1.5 rounded-sm text-xs font-mono border border-[#333] text-[#e1e2e6] relative overflow-hidden group editable-field">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5d5dff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"
                ></div>

                {isEditingOwner ? (
                  <input
                    ref={ownerInputRef}
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    onBlur={() => setIsEditingOwner(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingOwner(false)}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#5d5dff] text-white editable-input"
                  />
                ) : (
                  <>
                    {owner}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={handleCopyOwner} className="p-0.5 rounded hover:bg-[#333]">
                        <Copy className="h-3 w-3 text-[#888] hover:text-white" />
                      </button>
                      <button onClick={() => setIsEditingOwner(true)} className="p-0.5 rounded hover:bg-[#333] edit-button">
                        <Edit2 className="h-3 w-3 text-[#888] hover:text-[#5d5dff]" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Error Section Component
const ErrorSection = ({ error }: { error: ErrorCode }) => {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center mb-1 group">
        <div className="w-2 h-2 rounded-sm bg-[#e53e3e] mr-2"></div>
        <span className="text-sm flex-1">{error.name}</span>
      </div>

      <div className="ml-4 p-2 bg-[#1a1a24] rounded-sm border border-[#333] text-xs relative overflow-hidden group">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e53e3e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"
        ></div>

        <div className="flex items-center">
          <XCircle className="h-3 w-3 text-[#e53e3e] mr-1 flex-shrink-0" />
          <p className="text-[#888] font-sans flex-1">{error.message}</p>
        </div>

        <div className="absolute -bottom-2 -right-2">
          <div className="w-8 h-8 rounded-full bg-[#e53e3e]/5 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#e53e3e]/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Section Component
const EventSection = ({ event }: { event: Event }) => {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center mb-1 group">
        <div className="w-2 h-2 rounded-sm bg-[#d69e2e] mr-2"></div>
        <span className="text-sm flex-1">{event.name}</span>
      </div>

      <div className="ml-4 p-2 bg-[#1a1a24] rounded-sm border border-[#333] text-xs relative overflow-hidden group">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d69e2e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"
        ></div>

        <div className="flex items-center">
          <Zap className="h-3 w-3 text-[#d69e2e] mr-1 flex-shrink-0" />
          <p className="text-[#888] font-sans flex-1">{event.description}</p>
        </div>

        <div className="absolute -bottom-2 -right-2">
          <div className="w-8 h-8 rounded-full bg-[#d69e2e]/5 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#d69e2e]/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Section Component
const InputSection = ({ parameter }: { parameter: Parameter }) => {
  const [value, setValue] = useState(parameter.value || "");
  const [isEditingValue, setIsEditingValue] = useState(false);
  
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [isEditingValue]);

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center mb-1 group">
        <div className="w-2 h-2 rounded-sm bg-[#36b37e] mr-2"></div>
        <span className="text-sm flex-1">{parameter.label}</span>
        <span className="ml-auto text-xs bg-[#121218] px-1.5 py-0.5 rounded-sm border border-[#333] font-mono">
          {parameter.type}
        </span>
      </div>

      <div className="ml-4 bg-[#1a1a24] p-2 rounded-sm text-sm border border-[#333] font-mono flex items-center relative overflow-hidden group editable-field">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#36b37e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"
        ></div>

        <Cpu className="h-3 w-3 text-[#36b37e] mr-2" />

        {isEditingValue ? (
          <input
            ref={valueInputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setIsEditingValue(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingValue(false)}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#36b37e] text-white editable-input"
          />
        ) : (
          <>
            <span className="flex-1">{value}</span>
            <button
              onClick={() => setIsEditingValue(true)}
              className="edit-button"
            >
              <Edit2 className="h-3 w-3 text-[#888] hover:text-[#36b37e]" />
            </button>
          </>
        )}

        <div className="absolute -bottom-2 -right-2">
          <div className="w-8 h-8 rounded-full bg-[#36b37e]/5 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#36b37e]/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Section
const ContentSection = ({ 
  title, 
  icon,
  accentColor,
  children,
  defaultOpen = false 
}: { 
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  return (
    <div className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a24] shadow-[0_0_10px_rgba(93,93,255,0.05)] mb-4 last:mb-0">
      <div
        className="p-2 flex items-center justify-between bg-[#1a1a24] border-b border-[#333]"
      >
        <div className="flex items-center">
          <div className={`w-1 h-6 ${accentColor} rounded-sm mr-2`}></div>
          <h4 className="text-sm font-medium tracking-tight">{title}</h4>
        </div>
      </div>

      <div className="p-3 bg-[#121218]">
        {children}
      </div>
    </div>
  );
};

export function InstructionGroupNode({ data }: { data: InstructionGroupNodeData }) {
  const { setActiveTab, setSelectedFile } = useContext(ProjectContext);
  
  const accounts = data.accounts || [];
  const parameters = data.parameters || [];
  const errorCodes = data.errorCodes || [];
  const events = data.events || [];
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("Context");
  
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div
      className="flex flex-col border-2 border-solid transition-all ease-in-out parent-node"
      style={{
        width: '440px',
        minWidth: '440px',
        maxWidth: '440px',
        height: '500px',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: '#121218',
        borderColor: '#333',
        borderRadius: '8px',
        color: '#e1e2e6',
      }}
    >
      {/* Main Header */}
      <div
        className="p-3 flex items-center bg-[#1a1a24] border-b border-[#333] pl-6 sticky top-0 z-10"
      >
        {/* <Cpu className="h-5 w-5 text-[#5d5dff] mr-2" /> */}
        <h3 className="font-medium flex-1 tracking-tight">{data.label}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-[#121218] px-2 py-0.5 rounded-sm border border-[#333] font-mono text-[#5d5dff]">
            ID: 12345
          </span>
          <button className="p-1 rounded hover:bg-[#333] transition-colors">
            <Text className="h-4 w-4 text-[#888] hover:text-[#5d5dff]" />
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#5d5dff] to-[#5d5dff]/30"></div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="px-6 py-3 text-sm text-[#888] bg-[#121218]">
          {data.description}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#121218]">
        <button 
          className={`px-4 py-2 text-sm ${activeSection === "Context" ? "text-[#5d5dff] border-b-2 border-[#5d5dff]" : "text-[#888] hover:text-white"}`}
          onClick={() => setActiveSection("Context")}
        >
          Context
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeSection === "Inputs" ? "text-[#36b37e] border-b-2 border-[#36b37e]" : "text-[#888] hover:text-white"}`}
          onClick={() => setActiveSection("Inputs")}
        >
          Inputs
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeSection === "Errors" ? "text-[#e53e3e] border-b-2 border-[#e53e3e]" : "text-[#888] hover:text-white"}`}
          onClick={() => setActiveSection("Errors")}
        >
          Errors
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeSection === "Events" ? "text-[#d69e2e] border-b-2 border-[#d69e2e]" : "text-[#888] hover:text-white"}`}
          onClick={() => setActiveSection("Events")}
        >
          Events
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeSection === "Outputs" ? "text-purple-500 border-b-2 border-purple-500" : "text-[#888] hover:text-white"}`}
          onClick={() => setActiveSection("Outputs")}
        >
          Outputs
        </button>
      </div>

      {/* Content - Scrollable area */}
      <div 
        ref={contentRef}
        className="p-4 pl-6 bg-[#121218] flex-grow overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-[#1a1a24] nowheel" 
        onWheel={handleWheel}
      >
        {activeSection === "Context" && accounts.length > 0 && (
          <>
            {accounts.map((account, idx) => (
              <AccountSection key={idx} account={account} />
            ))}
          </>
        )}

        {activeSection === "Inputs" && parameters.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-[#36b37e]">Inputs</h4>
              <span className="text-xs bg-[#121218] px-2 py-0.5 rounded-sm border border-[#333] font-mono">
                Parameters
              </span>
            </div>
            {parameters.map((parameter, idx) => (
              <InputSection key={idx} parameter={parameter} />
            ))}
          </>
        )}

        {activeSection === "Errors" && errorCodes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-[#e53e3e]">Initialize Mint Error Codes</h4>
              <span className="text-xs bg-[#121218] px-2 py-0.5 rounded-sm border border-[#333] font-mono">
                Errors
              </span>
            </div>
            {errorCodes.map((error, idx) => (
              <ErrorSection key={idx} error={error} />
            ))}
          </>
        )}

        {activeSection === "Events" && events.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-[#d69e2e]">Initialize Mint Events</h4>
              <span className="text-xs bg-[#121218] px-2 py-0.5 rounded-sm border border-[#333] font-mono">
                Events
              </span>
            </div>
            {events.map((event, idx) => (
              <EventSection key={idx} event={event} />
            ))}
          </>
        )}

        {activeSection === "Outputs" && (
          <div className="flex items-center justify-center h-full text-[#888]">
            No outputs defined
          </div>
        )}
      </div>

      {/* Footer with counters - Fixed at bottom */}
      <div className="border-t border-[#333] p-3 text-xs text-[#888] font-mono flex justify-between items-center bg-[#121218]">
        <div className="flex items-center">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a24] border border-[#333] mr-1">
            <Hash className="h-3 w-3 text-[#5d5dff]" />
          </div>
          <span>Accounts: {accounts.length}</span>
        </div>
        <div className="flex items-center">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a24] border border-[#333] mr-1">
            <Hash className="h-3 w-3 text-[#36b37e]" />
          </div>
          <span>Inputs: {parameters.length}</span>
        </div>
        <div className="flex items-center">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a24] border border-[#333] mr-1">
            <Hash className="h-3 w-3 text-[#e53e3e]" />
          </div>
          <span>Errors: {errorCodes.length}</span>
        </div>
        <div className="flex items-center">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a24] border border-[#333] mr-1">
            <Hash className="h-3 w-3 text-[#d69e2e]" />
          </div>
          <span>Events: {events.length}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
    </div>
  );
}
