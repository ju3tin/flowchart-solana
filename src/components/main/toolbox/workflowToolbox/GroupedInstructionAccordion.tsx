import React from "react";
import {
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from "../../../ui/accordion";
import { groupedInstructions } from "../../../../data/toolbox/instructionItems";
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Layers, 
  Briefcase, 
  Droplet 
} from "lucide-react";

import { InstructionCard } from "./ToolboxInstructions";

const accordionStyles = `
  .accordion-item[data-state="open"] .chevron-icon {
    transform: rotate(180deg);
  }
`;

export function GroupedInstructionsAccordion() {
  // Use exact colors from the new design
  const textColor = "#fff";
  const iconColor = "#fff";
  const borderColor = "#2a2a2d";
  const accordionBgColor = "#121214";

  // Map of category labels to their icons and colors
  const categoryIcons: Record<string, { icon: any; color: string }> = {
    "SPL Token Instructions": { icon: <Package className="h-4 w-4 text-white" />, color: "blue" },
    "NFT and Metaplex Instructions": { icon: <Layers className="h-4 w-4 text-white" />, color: "purple" },
    "Governance Instructions": { icon: <Briefcase className="h-4 w-4 text-white" />, color: "green" },
    "DeFi Instructions": { icon: <Droplet className="h-4 w-4 text-white" />, color: "amber" },
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-emerald-500";
      case "purple":
        return "bg-purple-500";
      case "amber":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div style={{ backgroundColor: accordionBgColor, padding: 0 }}>
      <style>{accordionStyles}</style>
      <AccordionRoot type="multiple" defaultValue={["SPL Token Instructions"]}>
        {groupedInstructions.map((group) => {
          const categoryInfo = categoryIcons[group.label] || { icon: <Package className="h-4 w-4 text-white" />, color: "blue" };

          return (
            <AccordionItem
              key={group.label}
              value={group.label}
              className="border-b border-[#2a2a2d] accordion-item"
            >
              <AccordionItemTrigger
                className="flex items-center justify-between w-full p-3 text-sm font-medium transition-all duration-200 hover:bg-[#2a2a2d]/20"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-5 w-5 rounded flex items-center justify-center ${getColorClass(categoryInfo.color)}`}
                  >
                    {categoryInfo.icon}
                  </div>
                  <span className="font-medium">{group.label}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-xs px-1.5 py-0.5 rounded bg-[#2a2a2d] text-white">{group.items.length}</span>
                  <ChevronDown
                    className="chevron-icon h-4 w-4 text-[#6e6e76] transition-transform duration-200"
                  />
                </div>
              </AccordionItemTrigger>

              <AccordionItemContent className="animate-accordion-down">
                <div>
                  {group.items.map((instruction) => (
                    <div key={instruction.name} className="text-sm w-full">
                      <InstructionCard
                        key={instruction.name}
                        name={instruction.name}
                        flow={instruction.flow}
                      />
                    </div>
                  ))}
                </div>
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </AccordionRoot>
    </div>
  );
}