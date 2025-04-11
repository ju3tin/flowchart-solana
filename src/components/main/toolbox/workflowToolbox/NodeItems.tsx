import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Tabs, TabsContent } from "../../../ui/tabs";
import { GroupedInstructionsAccordion } from './GroupedInstructionAccordion';
import { GroupedOffChainAccordion } from './GroupedOffChainAccordion';
import { ToolboxPrograms } from './ToolboxPrograms';
import 'simplebar-react/dist/simplebar.min.css';
import SimpleBar from 'simplebar-react';
import { cn } from '../../../../lib/utils';
import { Star, Clock } from 'lucide-react';

interface NodeItemsProps {
    activeChainTab?: string;
}

export const NodeItems = forwardRef<{ setActiveChainTab: (tab: string) => void }, NodeItemsProps>(
    ({ activeChainTab: initialActiveChainTab = 'onChain' }, ref) => {
        const [activeChainTab, setActiveChainTab] = useState(initialActiveChainTab);
        const [activeSectionTab, setActiveSectionTab] = useState('instructions');

        // Expose setActiveChainTab method to parent via ref
        useImperativeHandle(ref, () => ({
            setActiveChainTab: (tab: string) => {
                setActiveChainTab(tab);
            }
        }));

        // Update state when prop changes
        useEffect(() => {
            if (initialActiveChainTab) {
                setActiveChainTab(initialActiveChainTab);
            }
        }, [initialActiveChainTab]);

        return (
            <div className="flex flex-col w-full h-full" style={{ backgroundColor: "#121214" }}>
                <Tabs
                    defaultValue="onChain"
                    value={activeChainTab}
                    style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#121214" }}
                >
                    {/* We keep the original tabs hidden as they are now controlled by the parent */}
                    <div className="hidden">
                        <button
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium transition-colors chain-tabs",
                                activeChainTab === "onChain"
                                    ? "bg-[#2A3347] text-[#E9ECEF] border-b-2 border-[#80a3ff]"
                                    : "text-[#A0AEC0] hover:bg-[#2A3347]",
                            )}
                            onClick={() => setActiveChainTab("onChain")}
                        >
                            On-Chain
                        </button>
                        <button
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium transition-colors chain-tabs",
                                activeChainTab === "offChain"
                                    ? "bg-[#2A3347] text-[#E9ECEF] border-b-2 border-[#80a3ff]"
                                    : "text-[#A0AEC0] hover:bg-[#2A3347]",
                            )}
                            onClick={() => setActiveChainTab("offChain")}
                        >
                            Off-Chain
                        </button>
                    </div>

                    <TabsContent
                        value="onChain"
                        style={{ 
                            flex: 1, 
                            display: activeChainTab === "onChain" ? "flex" : "none", 
                            flexDirection: "column", 
                            overflow: "hidden", 
                            marginTop: 0, 
                            backgroundColor: "#121214" 
                        }}
                    >
                        <Tabs 
                            defaultValue="instructions" 
                            value={activeSectionTab}
                            style={{ height: "100%", display: "flex", flexDirection: "column", width: "100%" }}
                        >
                            <div className="flex border-b border-[#2a2a2d] bg-transparent overflow-x-auto scrollbar-thin scrollbar-thumb-[#2a2a2d] scrollbar-track-transparent">
                                {[
                                    { id: "instructions", label: "Instructions" },
                                    { id: "programs", label: "Programs" },
                                    { id: "accounts", label: "Accounts" },
                                    { id: "inputs", label: "Inputs" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        className={`px-4 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 ${
                                            activeSectionTab === tab.id ? "text-white border-b-2 border-[#4d7cfe]" : "text-[#6e6e76] border-b-2 border-transparent hover:text-white"
                                        }`}
                                        onClick={() => setActiveSectionTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-hidden" style={{ backgroundColor: "#121214" }}>
                                <SimpleBar style={{ width: "100%", height: "100%" }}>
                                    {/* Favorites Section */}
                                    <div className="border-b border-[#2a2a2d]">
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-3 w-3 text-amber-300" />
                                                <span className="text-sm text-gray-300">Favorites</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2 text-xs px-1.5 py-0.5 rounded bg-[#2a2a2d] text-white">3</span>
                                            </div>
                                        </div>
                                    </div>

                                    <TabsContent 
                                        value="instructions" 
                                        style={{ 
                                            display: activeSectionTab === "instructions" ? "block" : "none",
                                            marginTop: 0 
                                        }}
                                    >
                                        <GroupedInstructionsAccordion />
                                    </TabsContent>
                                    <TabsContent 
                                        value="programs" 
                                        style={{ 
                                            display: activeSectionTab === "programs" ? "block" : "none",
                                            marginTop: 0,
                                            padding: "16px" 
                                        }}
                                    >
                                        <ToolboxPrograms />
                                    </TabsContent>
                                    <TabsContent 
                                        value="accounts" 
                                        style={{ 
                                            display: activeSectionTab === "accounts" ? "block" : "none",
                                            marginTop: 0 
                                        }}
                                    >
                                    </TabsContent>
                                    <TabsContent 
                                        value="inputs" 
                                        style={{ 
                                            display: activeSectionTab === "inputs" ? "block" : "none",
                                            marginTop: 0 
                                        }}
                                    >
                                    </TabsContent>
                                </SimpleBar>
                            </div>
                        </Tabs>
                    </TabsContent>

                    <TabsContent
                        value="offChain"
                        style={{ 
                            flex: 1, 
                            display: activeChainTab === "offChain" ? "flex" : "none",
                            flexDirection: "column", 
                            overflow: "hidden", 
                            marginTop: 0, 
                            backgroundColor: "#121214" 
                        }}
                    >
                        <SimpleBar style={{ width: "100%", height: "100%" }}>
                            <div>
                                {/* Favorites Section */}
                                <div className="border-b border-[#2a2a2d]">
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-amber-400" />
                                            <span className="font-medium">Favorites</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2 text-xs px-1.5 py-0.5 rounded bg-[#2a2a2d] text-white">2</span>
                                        </div>
                                    </div>
                                </div>

                                <GroupedOffChainAccordion />
                            </div>
                        </SimpleBar>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }
);