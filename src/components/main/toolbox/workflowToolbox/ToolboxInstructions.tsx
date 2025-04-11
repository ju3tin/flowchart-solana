import React, { useRef, useState } from 'react';
import { useColorModeValue } from '../../../ui/color-mode';
import { motion } from 'framer-motion';
import { groupedInstructions } from '../../../../data/toolbox/instructionItems'; 
import { Star, PlusCircle } from 'lucide-react';

const MotionDiv = motion.div;

interface InstructionCardProps {
  key: string;
  name: string;
  icon?: React.ElementType;
  flow?: any;
  nodeDefinition?: any;
  description?: string;
  isNew?: boolean;
  isFavorite?: boolean;
}

export function InstructionCard({ 
  name, 
  icon, 
  flow, 
  nodeDefinition, 
  description, 
  isNew = false,
  isFavorite = false 
}: InstructionCardProps) {
  const IconComponent = icon || null;
  const divRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (flow) {
      const isOffChainFlow = typeof flow === 'string' && flow === 'off-chain';
      const draggedData = {
        category: isOffChainFlow ? 'offChain' : 'onChain',
        nodes: isOffChainFlow && nodeDefinition ? [nodeDefinition] : (flow.nodes || []),
        edges: isOffChainFlow ? [] : (flow.edges || []),
        code: isOffChainFlow ? undefined : flow.code
      };
      
      event.dataTransfer.setData(
        "application/reactflow",
        JSON.stringify(draggedData)
      );
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement favorite toggling logic here
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (divRef.current) {
      const dragEvent = new DragEvent('dragstart', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: new DataTransfer(),
      });
      divRef.current.dispatchEvent(dragEvent);
      handleDragStart(dragEvent as unknown as React.DragEvent<HTMLDivElement>);
    }
  };

  React.useEffect(() => {
    const currentDiv = divRef.current;
    if (currentDiv) {
      currentDiv.addEventListener('dragstart', handleDragStart as any);
      return () => {
        currentDiv.removeEventListener('dragstart', handleDragStart as any);
      };
    }
  }, [flow, nodeDefinition]);

  return (
    <div
      ref={divRef}
      draggable
      className={`w-full px-4 py-2 text-sm transition-all duration-200 border-l-2 ${
        isHovered ? "bg-gray-800/30 border-blue-500" : "bg-transparent border-transparent"
      } cursor-pointer group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4d7cfe] mr-2"></div>
          <span className={`font-medium ${isHovered ? "text-white" : "text-gray-300"}`}>{name}</span>
          {isNew && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              New
            </span>
          )}
        </div>
        <div
          className={`flex items-center space-x-1 ${isHovered ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        >
          <button
            onClick={toggleFavorite}
            className={`p-1 rounded-full hover:bg-gray-700/50 ${isFavorite ? "text-amber-400" : "text-gray-400 hover:text-amber-400"}`}
          >
            <Star className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleAdd}
            className="p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-blue-400"
          >
            <PlusCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {description && isHovered && (
        <div className="mt-1 text-xs text-gray-400 pl-4 border-l border-gray-700/50">{description}</div>
      )}
    </div>
  );
}

export const ToolboxInstructions = () => {
  return (
    <div className="p-2">
      {groupedInstructions.map((group) => (
        <div key={group.label} className="mb-4">
          <span className="font-bold block mb-2" style={{ color: "#E5E7EB" }}>
            {group.label}
          </span>

          <div className="grid grid-cols-3 gap-3">
            {group.items.map((item) => (
              <InstructionCard
                key={item.name}
                name={item.name}
                flow={item.flow}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
