// Instruction Node component for landing page
import React, { useState } from 'react';

type InstructionNodeProps = {
  id: string;
  name: string;
  description: string;
  status: string;
  accounts: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  inputs: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  codePreview: string;
};

const InstructionNode: React.FC<InstructionNodeProps> = ({
  id,
  name,
  description,
  status,
  accounts,
  inputs,
  codePreview
}) => {
  const [activeTab, setActiveTab] = useState<'Context' | 'Inputs' | 'Errors' | 'Events'>('Context');

  return (
    <div className="w-full h-full bg-[#121218] rounded-xl border border-[#333] overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#333] bg-[#1a1a24]">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#1a1a24] border border-[#333]">
            <svg className="w-4 h-4 text-[#5d5dff]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L3 11L10 14L13 21L20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium text-xs">{name}</h3>
            <p className="text-[#888] text-[10px]">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="px-1.5 py-0.5 text-[10px] bg-[#121218] rounded border border-[#333] text-white">
            ID: {id}
          </div>
          <div className="flex items-center px-1.5 py-0.5 text-[10px] bg-[#121218] rounded border border-[#333]">
            <span className="w-1 h-1 rounded-full bg-green-400 mr-1"></span>
            <span className="text-white">{status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#121218]">
        <button 
          className={`cursor-pointer px-3 py-1.5 text-[10px] ${activeTab === 'Context' ? 'text-[#5d5dff] border-b-2 border-[#5d5dff]' : 'text-[#888] hover:text-white'}`}
          onClick={() => setActiveTab('Context')}
        >
          Context
        </button>
        <button 
          className={`cursor-pointer px-3 py-1.5 text-[10px] ${activeTab === 'Inputs' ? 'text-[#36b37e] border-b-2 border-[#36b37e]' : 'text-[#888] hover:text-white'}`}
          onClick={() => setActiveTab('Inputs')}
        >
          Inputs
        </button>
        <button 
          className={`cursor-pointer px-3 py-1.5 text-[10px] ${activeTab === 'Errors' ? 'text-[#e53e3e] border-b-2 border-[#e53e3e]' : 'text-[#888] hover:text-white'}`}
          onClick={() => setActiveTab('Errors')}
        >
          Errors
        </button>
        <button 
          className={`cursor-pointer px-3 py-1.5 text-[10px] ${activeTab === 'Events' ? 'text-[#d69e2e] border-b-2 border-[#d69e2e]' : 'text-[#888] hover:text-white'}`}
          onClick={() => setActiveTab('Events')}
        >
          Events
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-auto max-h-[230px]">
        {activeTab === 'Context' && (
          <div className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a24] shadow-[0_0_10px_rgba(93,93,255,0.05)] mb-3">
            <div className="p-1.5 flex items-center justify-between bg-[#1a1a24] border-b border-[#333]">
              <div className="flex items-center">
                <div className="w-1 h-5 bg-[#5d5dff] rounded-sm mr-2"></div>
                <h4 className="text-[10px] font-medium tracking-tight text-white">Accounts</h4>
              </div>
            </div>

            <div className="p-2 bg-[#121218]">
              {accounts.map((account, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex justify-between">
                    <div className="text-[#e1e2e6] text-[10px] font-medium">{account.name}</div>
                    <div className="text-[#888] text-[10px]">{account.type}</div>
                  </div>
                  <div className="text-[#888] text-[10px] mt-0.5">{account.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Inputs' && (
          <div className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a24] shadow-[0_0_10px_rgba(54,179,126,0.05)] mb-3">
            <div className="p-1.5 flex items-center justify-between bg-[#1a1a24] border-b border-[#333]">
              <div className="flex items-center">
                <div className="w-1 h-5 bg-[#36b37e] rounded-sm mr-2"></div>
                <h4 className="text-[10px] font-medium tracking-tight text-white">Input Parameters</h4>
              </div>
            </div>

            <div className="p-2 bg-[#121218]">
              {inputs.map((input, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex justify-between">
                    <div className="text-[#e1e2e6] text-[10px] font-medium">{input.name}</div>
                    <div className="text-[#888] text-[10px]">{input.type}</div>
                  </div>
                  <div className="text-[#888] text-[10px] mt-0.5">Value: {input.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Errors' && (
          <div className="flex items-center justify-center p-4">
            <div className="text-[#888] text-[10px]">No error codes defined</div>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="flex items-center justify-center p-4">
            <div className="text-[#888] text-[10px]">No events defined</div>
          </div>
        )}
        
        <div className="bg-[#1a1a24] rounded-lg p-2 border border-[#333]">
          <div className="mb-1 text-[10px] text-[#888]">Code Preview:</div>
          <pre className="text-[9px] text-gray-300 bg-[#0a0b14] p-2 rounded border border-[#2a2d4a] overflow-x-auto">
            <code>
              {codePreview}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InstructionNode; 
