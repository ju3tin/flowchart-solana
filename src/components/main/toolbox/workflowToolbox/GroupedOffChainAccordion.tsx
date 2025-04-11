import React from "react";
import {
    AccordionRoot,
    AccordionItem,
    AccordionItemTrigger,
    AccordionItemContent,
} from "@/components/ui/accordion";
import { InstructionCard } from "./ToolboxInstructions";
import { createNftNode } from "../../../../data/nodes/offChain/nftMetaplex/createNftNodeData";
import { mintNftNode } from "../../../../data/nodes/offChain/nftMetaplex/mintNftNodeData";
import { 
    ChevronDown, 
    ChevronUp, 
    Package, 
    Layers, 
    Briefcase, 
    Droplet, 
    Coins
} from "lucide-react";

// Add styles for the accordion
const accordionStyles = `
  .accordion-item[data-state="open"] .chevron-icon {
    transform: rotate(180deg);
  }
`;

const offChainInstructions = [
    {
        label: "Fungible Tokens",
        icon: <Coins className="h-4 w-4 text-white" />,
        color: "blue",
        items: [
            { name: "Create a Token Mint", flow: "off-chain" },
            { name: "Mint a Token", flow: "off-chain" },
            { name: "Transfer a Token", flow: "off-chain" },
            { name: "Burn a Token", flow: "off-chain" },
            { name: "Create Associated Token Account", flow: "off-chain" },
            { name: "Freeze a Token Account", flow: "off-chain" },
            { name: "Thaw a Frozen Token Account", flow: "off-chain" },
            { name: "Set Token Authority", flow: "off-chain" },
            { name: "Close a Token Account", flow: "off-chain" },
        ]
    },
    {
        label: "NFTs (Metaplex)",
        icon: <Layers className="h-4 w-4 text-white" />,
        color: "purple",
        items: [
            { name: "Mint an NFT", flow: "off-chain", nodeDefinition: createNftNode },
            { name: "Transfer an NFT", flow: "off-chain" },
            { name: "Burn an NFT", flow: "off-chain" },
            { name: "Create Candy Machine", flow: "off-chain" },
            { name: "Add Items to Candy Machine", flow: "off-chain" },
            { name: "Mint from Candy Machine", flow: "off-chain", nodeDefinition: mintNftNode },
            { name: "Update Candy Machine", flow: "off-chain" },
            { name: "Delete Candy Machine", flow: "off-chain" },
        ]
    },
    {
        label: "Auction House (Metaplex)",
        icon: <Package className="h-4 w-4 text-white" />,
        color: "amber",
        items: [
            { name: "Create Auction", flow: "off-chain" },
            { name: "Place Bid", flow: "off-chain" },
            { name: "Cancel Auction", flow: "off-chain" },
        ]
    },
    {
        label: "Governance",
        icon: <Briefcase className="h-4 w-4 text-white" />,
        color: "green",
        items: [
            { name: "Create Proposal", flow: "off-chain" },
            { name: "Cast Vote", flow: "off-chain" },
            { name: "Execute Proposal", flow: "off-chain" },
        ]
    },
];

export function GroupedOffChainAccordion() {
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
        <div style={{ backgroundColor: "#121214", padding: 0 }}>
            <style>{accordionStyles}</style>
            <AccordionRoot type="multiple" defaultValue={["Fungible Tokens"]}>
                {offChainInstructions.map((group) => (
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
                                    className={`h-5 w-5 rounded flex items-center justify-center ${getColorClass(group.color)}`}
                                >
                                    {group.icon}
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
                            <div className="pl-10 pr-3 pb-2">
                                {group.items.map((instruction) => (
                                    <div key={instruction.name} className="py-1.5 text-sm w-full">
                                        <InstructionCard
                                            key={instruction.name}
                                            name={instruction.name}
                                            flow={instruction.flow}
                                            nodeDefinition={instruction.nodeDefinition}
                                        />
                                    </div>
                                ))}
                            </div>
                        </AccordionItemContent>
                    </AccordionItem>
                ))}
            </AccordionRoot>
        </div>
    );
} 