import React, { useState } from "react";
import { Handle, Position } from '@xyflow/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import "@/styles/nodes/basicNodeStyle.css";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

//Icons
import { FiFileText, FiTerminal, FiChevronDown, FiChevronRight, FiKey } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";

// Simple toggle component 
interface ToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
}

const Toggle: React.FC<ToggleProps> = ({ isChecked, onChange, color = "#4dabf7" }) => {
  return (
    <button 
      className="relative w-9 h-5 rounded-lg transition-colors border border-solid"
      style={{
        backgroundColor: isChecked ? color : "var(--node-section-bg-dark)",
        borderColor: isChecked ? color : "var(--node-border-dark)",
      }}
      onClick={() => onChange(!isChecked)}
    >
      <div 
        className="absolute w-3.5 h-3.5 rounded-full bg-white top-0.5 transition-all"
        style={{
          left: isChecked ? "18px" : "3px",
        }}
      />
    </button>
  );
};

interface AccountInfo {
  key: string;
  isSigner: boolean;
  isWritable: boolean;
  lamports: number;
  rentEpoch: number;
  owner: string;
  executable: boolean;
  data: string;
}

interface Account {
  label: string;
  type?: string;
  description?: string;
  info?: AccountInfo;
}

interface ContextNodeProps {
  data: {
    label: string;
    accounts?: Account[];
    onUpdateAccount?: (accountName: string, info: any) => void;
    onUpdate?: (accountName: string, account: any) => void;
  };
}

export const ContextNode: React.FC<ContextNodeProps> = ({ data }) => {
  const { label, accounts } = data;
  
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [localAccounts, setLocalAccounts] = useState<Account[]>(
    (accounts || []).map(account => {
      // Process account data with defaults
      const processedAccount = {
        ...account,
        info: account.info || {
          key: "",
          isSigner: false,
          isWritable: false,
          lamports: 0,
          rentEpoch: 0,
          owner: "",
          executable: false,
          data: ""
        }
      };
      
      return processedAccount;
    })
  );

  const bgColor = useColorModeValue('var(--node-background-light)', 'var(--node-background-dark)');
  const borderColor = useColorModeValue('var(--node-border-light)', 'var(--node-border-dark)');
  const headerBg = useColorModeValue('var(--node-context-header-bg-light)', 'var(--node-context-header-bg-dark)');
  const accentColor = useColorModeValue('var(--blue-badge-color)', 'var(--blue-badge-color)');
  const textColor = useColorModeValue('var(--node-text-light)', 'var(--node-text-dark)');
  const textMutedColor = useColorModeValue('var(--node-text-muted-light)', 'var(--node-text-muted-dark)');
  const handleColor = useColorModeValue('var(--node-handle-light)', 'var(--node-handle-dark)');
  const sectionBg = useColorModeValue('var(--node-section-bg-light)', 'var(--node-section-bg-dark)');
  const inputBg = useColorModeValue('var(--node-input-light)', 'var(--node-input-dark)');
  const inputBorderColor = useColorModeValue('var(--node-input-border-light)', 'var(--node-input-border-dark)');
  const inputTextColor = useColorModeValue('var(--node-input-text-light)', 'var(--node-input-text-dark)');
  
  const toggleAccount = (accountName: string) => {
    if (expandedAccount === accountName) {
      setExpandedAccount(null);
    } else {
      setExpandedAccount(accountName);
    }
  };
  
  const handleAccountChange = (accountName: string, field: string, value: any) => {
    const updatedAccounts = localAccounts.map(account => {
      if (account.label === accountName) {
        // For top-level properties
        if (field in account) {
          return { ...account, [field]: value };
        }
        // For nested info properties
        if (account.info && field in account.info) {
          return { 
            ...account, 
            info: { ...account.info, [field]: value } 
          };
        }
      }
      return account;
    });
    
    setLocalAccounts(updatedAccounts);
    
    // Update parent component if needed
    const updatedAccount = updatedAccounts.find(a => a.label === accountName);
    if (updatedAccount && data.onUpdateAccount) {
      data.onUpdateAccount(accountName, updatedAccount.info);
    }
    if (updatedAccount && data.onUpdate) {
      data.onUpdate(accountName, updatedAccount);
    }
  };

  return (
    <div
      className="flex flex-col min-w-[280px] max-w-[320px] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2a2b36] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      style={{
        background: "linear-gradient(to bottom, #1a1e2e, #141824)",
      }}
    >
      {/* Header */}
      <div 
        className="flex flex-row justify-start items-center gap-2 p-3 text-sm font-semibold rounded-t-lg"
        style={{ background: "linear-gradient(to right, #1e2235, #1a1e2e)", borderBottom: "1px solid #2a2b36" }}
      >
        <div className="bg-[#4dabf7] w-1.5 h-6 rounded-sm mr-3"></div>
        <FiFileText className="h-4 w-4 text-[#4dabf7] mr-2" />
        <span className="font-medium tracking-wide">{label} Context</span>
        <div className="flex-grow"></div>
        <Badge 
          variant="outline" 
          className="bg-[#1e2235] text-[#4dabf7] border-[#4dabf7]/30 text-xs px-2"
        >
          Accounts
        </Badge>
      </div>

      {/* Content Area with Tailwind scrollbar */}
      <div
        className="h-auto max-h-80 w-full overflow-y-auto pointer-events-auto p-4
                 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#272e3f] hover:scrollbar-thumb-[#374151]"
        onWheelCapture={(e) => {
          // Prevent React Flow from zooming/scrolling the canvas
          e.stopPropagation();
        }}
      >
        {localAccounts?.map((acct, idx) => (
          <div 
            key={idx} 
            className={`
              rounded-md transition-all duration-200
              ${expandedAccount === acct.label ? "bg-[#161a28] shadow-md" : "hover:bg-[#161a28]/50"}
              mb-3
            `}
          >
            {/* Account Header - Always visible */}
            <div 
              className="flex flex-row p-2 items-center justify-between cursor-pointer"
              onClick={() => toggleAccount(acct.label)}
            >
              <div className="flex items-center">
                <div className="flex items-center hover:text-[#4dabf7] transition-colors">
                  <div className="bg-[#1e2235] rounded-md p-1 mr-2">
                    {expandedAccount === acct.label ? (
                      <FiChevronDown className="h-3 w-3 text-[#4dabf7]" />
                    ) : (
                      <FiChevronRight className="h-3 w-3 text-[#4dabf7]" />
                    )}
                  </div>
                  <span className="font-medium text-[#4dabf7]">{acct.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {acct.info?.isSigner && (
                  <Badge 
                    className="bg-[#4dabf7]/10 text-[#4dabf7] border-[#4dabf7]/20 text-xs px-2"
                  >
                    Signer
                  </Badge>
                )}
                {acct.info?.isWritable && (
                  <Badge 
                    className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 text-xs px-2"
                  >
                    Writable
                  </Badge>
                )}
                <span className="text-xs text-gray-400">{acct.type || ""}</span>
              </div>
            </div>
            
            {/* Description - Always visible */}
            {acct.description && (
              <div className="text-sm text-gray-400 ml-9 mt-1 px-2 pb-2">
                {acct.description}
              </div>
            )}
            
            {/* Expanded Content - Only visible when expanded */}
            {expandedAccount === acct.label && (
              <div className="bg-gradient-to-b from-[#13141f] to-[#0d0e17] rounded-b-md p-4 mx-2 mb-2 border-t border-[#2a2b36]/50">
                <div className="flex flex-col gap-4">
                  {/* Public Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <FiKey className="h-3.5 w-3.5 text-[#4dabf7]" />
                        <span className="text-sm font-medium text-gray-300">Public Key</span>
                      </div>
                      <Badge className="bg-[#1a1b26]/60 text-[#4dabf7] border-[#4dabf7]/20 text-xs px-2 font-mono">
                        Address
                      </Badge>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4dabf7]/10 to-transparent rounded-md blur-sm group-hover:blur-md transition-all duration-300 opacity-50"></div>
                      <Input
                        value={acct.info?.key || ''}
                        className="h-8 bg-[#1a1b26]/80 border-[#2a2b36] text-xs pl-8 font-mono relative z-10 backdrop-blur-sm"
                        onChange={(e) => handleAccountChange(acct.label, 'key', e.target.value)}
                      />
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
                        <div className="h-3 w-3 rounded-full bg-[#4dabf7]/20 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#4dabf7]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Is Signer */}
                    <div className="bg-gradient-to-r from-[#1a1b26]/80 to-[#1a1b26]/60 p-3 rounded-md border border-[#2a2b36] backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#4dabf7]"></div>
                          <span className="text-sm font-medium text-gray-300">Is Signer</span>
                        </div>
                        <Toggle
                          isChecked={acct.info?.isSigner || false}
                          onChange={(checked) => handleAccountChange(acct.label, 'isSigner', checked)}
                          color="#4dabf7"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 ml-3.5">
                        {acct.info?.isSigner ? "Signs transaction" : "Does not sign"}
                      </div>
                    </div>
                    
                    {/* Is Writable */}
                    <div className="bg-gradient-to-r from-[#1a1b26]/80 to-[#1a1b26]/60 p-3 rounded-md border border-[#2a2b36] backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#22c55e]"></div>
                          <span className="text-sm font-medium text-gray-300">Is Writable</span>
                        </div>
                        <Toggle
                          isChecked={acct.info?.isWritable || false}
                          onChange={(checked) => handleAccountChange(acct.label, 'isWritable', checked)}
                          color="#22c55e"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 ml-3.5">
                        {acct.info?.isWritable ? "Can be modified" : "Read-only access"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Lamports */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#f59e0b]"></div>
                        <span className="text-sm font-medium text-gray-300">Lamports</span>
                      </div>
                      <div className="relative">
                        <Input
                          className="h-8 bg-[#1a1b26]/80 border-[#2a2b36] text-xs font-mono pl-6 backdrop-blur-sm"
                          value={acct.info?.lamports !== undefined ? acct.info.lamports.toString() : '0'}
                          onChange={(e) => handleAccountChange(acct.label, 'lamports', parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#f59e0b] opacity-50">
                          <span className="font-mono text-xs">◎</span>
                        </div>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <span className="text-xs font-mono">
                            {((acct.info?.lamports || 0) / 1e9).toFixed(9)} SOL
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rent Epoch */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#a855f7]"></div>
                        <span className="text-sm font-medium text-gray-300">Rent Epoch</span>
                      </div>
                      <div className="relative">
                        <Input
                          className="h-8 bg-[#1a1b26]/80 border-[#2a2b36] text-xs font-mono backdrop-blur-sm"
                          value={acct.info?.rentEpoch !== undefined ? acct.info.rentEpoch.toString() : '0'}
                          readOnly
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Badge className="bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20 text-xs">
                            Epoch
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Owner */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <FiFileText className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span className="text-sm font-medium text-gray-300">Owner</span>
                      </div>
                      <Badge className="bg-[#1a1b26]/60 text-[#60a5fa] border-[#60a5fa]/20 text-xs px-2 font-mono">
                        Program
                      </Badge>
                    </div>
                    <div className="relative">
                      <Input
                        className="h-8 bg-[#1a1b26]/80 border-[#2a2b36] text-xs font-mono backdrop-blur-sm"
                        value={acct.info?.owner || ''}
                        onChange={(e) => handleAccountChange(acct.label, 'owner', e.target.value)}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {acct.info?.owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" && (
                          <Badge className="bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20 text-xs">
                            Token Program
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Executable */}
                  <div className="bg-gradient-to-r from-[#1a1b26]/80 to-[#1a1b26]/60 p-3 rounded-md border border-[#2a2b36] backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#a855f7]"></div>
                        <span className="text-sm font-medium text-gray-300">Executable</span>
                      </div>
                      <Toggle
                        isChecked={acct.info?.executable || false}
                        onChange={(checked) => handleAccountChange(acct.label, 'executable', checked)}
                        color="#a855f7"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-400 ml-3.5">
                      {acct.info?.executable ? "Contains program code" : "Data account only"}
                    </div>
                  </div>
                  
                  {/* Data */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <FiTerminal className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Data (hex)</span>
                      </div>
                      <Badge className="bg-[#1a1b26] text-gray-400 border-[#2a2b36] text-xs font-mono">
                        {acct.info?.data ? acct.info.data.length : 0} bytes
                      </Badge>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b26]/0 via-[#1a1b26]/5 to-[#1a1b26]/0 rounded-md"></div>
                      <Textarea
                        className="h-32 bg-[#13141f]/90 border-[#2a2b36] text-xs font-mono resize-none backdrop-blur-sm"
                        value={acct.info?.data || ''}
                        onChange={(e) => handleAccountChange(acct.label, 'data', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-mono px-1">
                      <span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
                      <span>ASCII</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Output Handle on the Right */}
      <Handle
        id="context-handle-right"
        type="source"
        position={Position.Right}
        style={{
          background: "#2a2b36",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          border: "2px solid white",
        }}
      />
    </div>
  );
};
