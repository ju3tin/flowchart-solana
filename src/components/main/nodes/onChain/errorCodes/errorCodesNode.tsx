import React from "react";
import { Handle, Position } from '@xyflow/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import "@/styles/nodes/basicNodeStyle.css";
import { Badge } from "@/components/ui/badge";

//Icons
import { IoMdAlert } from "react-icons/io";
import { FaCircle } from "react-icons/fa";

export const ErrorCodesNode = ({ data }: { data: any }) => {
  const { label, codes } = data;

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
        <div className="bg-[#ef4444] w-1.5 h-6 rounded-sm mr-3"></div>
        <IoMdAlert className="h-4 w-4 text-[#ef4444] mr-2" />
        <span className="font-medium tracking-wide">{label} Error Codes</span>
        <div className="flex-grow"></div>
        <Badge 
          variant="outline" 
          className="bg-[#1e2235] text-[#ef4444] border-[#ef4444]/30 text-xs px-2"
        >
          Errors
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {codes && codes.map((code: any, idx: number) => (
          <div 
            key={idx} 
            className="bg-[#161a28] rounded-md p-3 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center mb-1">
              <div className="h-2 w-2 rounded-full bg-[#ef4444] mr-2"></div>
              <span className="font-medium">{code.name}</span> 
            </div>
            <div 
              className="ml-4 text-sm text-gray-400 border-l-2 border-[#2a2b36] pl-2"
            >
              {code.message}
            </div>
          </div>
        ))}
      </div>

      {/* Handle */}
      <Handle
        id="error-codes-handle-left"
        type="source"
        position={Position.Left}
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
