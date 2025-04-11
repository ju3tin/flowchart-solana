"use client";

import React, { useContext, useState, useRef, useEffect } from 'react';
import '@/styles/toolbox/toolboxStyle.css';
import { NodeItems } from '@/components/main/toolbox/workflowToolbox/NodeItems';
import FileTree from '@/components/main/toolbox/codeToolbox/Filetree';
import ProjectContext from '@/context/project/ProjectContext';
import FileContext from '@/context/file/FileContext';
import UxContext from '@/context/ux/UxContext';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewProjectModal } from '@/components/ui/new-project-modal';
import ProjectListPopover from '../workflow/ProjectListPopover';
import { useSignAndSendTx } from '@/hooks/useSignAndSendTx';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from "sonner";
import { useColorModeValue } from '@/components/ui/color-mode';
import PulseLoader from "react-spinners/PulseLoader";
import { handleGenerateCode } from '@/utils/codeGeneration/handleGenerateCode';
import { handleDeployProgram } from '@/utils/project/deployUpgradableProgram';
import { saveProject } from '@/utils/project/saveProject';
import { handleConfirmNewProject, handleOpenProject, handleSaveClick } from '@/utils/project/projectUtils';
import {
  Search,
  X,
  Filter,
  Settings,
  Clock,
  BookOpen,
  Edit3,
  ArrowRight,
  Info,
  Tag,
  FolderOpen,
  Save,
  Plus,
  Code,
  Hammer,
  Rocket,
} from "lucide-react";

export const Toolbox = () => {
    const [isExpanded] = useState(true);
    const { projectContext, setProjectContext } = useContext(ProjectContext);
    const { fileTree, setFileTree, setSelectedFile } = useContext(FileContext);
    const { activeTab, setActiveTab, setUxOpenPanel } = useContext(UxContext);
    const [activeChainTab, setActiveChainTab] = useState<"on-chain" | "off-chain">("on-chain");
    const [projectName, setProjectName] = useState(projectContext.name || "My Token Project");
    const [isEditing, setIsEditing] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const nodeItemsRef = useRef<any>(null);
    
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [isProjectListModalOpen, setIsProjectListModalOpen] = useState(false);
    const [projectsRefreshCounter, setProjectsRefreshCounter] = useState(0);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCodeReady, setIsCodeReady] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState('option1');
    
    const signAndSendTx = useSignAndSendTx();
    const { publicKey } = useWallet();
    
    const deployModalBg = useColorModeValue('var(--toolbar-deploy-modal-bg-light)', 'var(--toolbar-deploy-modal-bg-dark)');
    const deployModalBorderColor = useColorModeValue('var(--toolbar-deploy-modal-border-light)', 'var(--toolbar-deploy-modal-border-dark)');
    const deployModalTextColor = useColorModeValue('var(--toolbar-deploy-modal-text-light)', 'var(--toolbar-deploy-modal-text-dark)');

    useEffect(() => {
        setProjectName(projectContext.name || "My Token Project");
    }, [projectContext.name]);

    const handleTabChange = (tab: "on-chain" | "off-chain") => {
        setActiveChainTab(tab);
        if (nodeItemsRef.current) {
            nodeItemsRef.current.setActiveChainTab(tab === "on-chain" ? "onChain" : "offChain");
        }
    };

    const handleNewProject = () => {
        setIsNewProjectModalOpen(true);
    };

    const handleCreateProject = (data: { name: string; description: string; repoUrl?: string }) => {
        handleConfirmNewProject(
            projectContext, 
            setProjectContext, 
            data.name, 
            data.description, 
            projectsRefreshCounter, 
            setProjectsRefreshCounter, 
            setUxOpenPanel,
            setFileTree,
            setSelectedFile
        );
        setIsNewProjectModalOpen(false);
    };

    const handleOpenProjectClick = () => {
        setIsProjectListModalOpen(true);
    };
    
    const handleSaveProject = () => {
        handleSaveClick(
            projectContext, 
            setProjectContext, 
            projectsRefreshCounter, 
            setProjectsRefreshCounter
        );
    };
    
    const handleGenerateClick = async () => {
        if (isGenerating) return;
        try {
            const saveResp = await saveProject(projectContext, setProjectContext);
            if (!saveResp) {
                console.log('No saveResp, cannot generate code');
                return;
            }
            const projectId = saveResp.project?.id;  
            setIsGenerating(true);
            
            await handleGenerateCode(
                { ...projectContext, id: projectId },
                setIsGenerating,
                setIsCodeReady,
                (tab: any) => setActiveTab(tab),
                setFileTree,
                setProjectContext
            );
        } catch (error) {
            console.error('Error generating code:', error);
            setIsGenerating(false);
        }
    };
    
    const handleViewCode = () => { 
        setActiveTab('code'); 
    };
    
    const handleOpenDeployModal = () => {
        setShowDeployModal(true);
    };

    const handleDeployCancel = () => {
        setShowDeployModal(false);
    };
    
    const handleDeployClick = async () => {
        if (isDeploying) return;
        setIsDeploying(true);
        try {
            if (!publicKey) {
                throw new Error('No wallet connected');
            }
            
            const programKeypair = await handleDeployProgram(
                projectContext, 
                setProjectContext, 
                publicKey, 
                signAndSendTx, 
                'devnet',
                selectedOption === 'option1' ? 'fullWallet' : 'delegated'
            );
            if (!programKeypair) {
                toast("Program deployment failed", {
                    description: "Failed to deploy the program",
                    style: { backgroundColor: "#f87171", color: "white" }
                });
                return;
            }
            toast("Program successfully deployed", {
                description: `Program deployed to: ${programKeypair.toBase58()}`,
                style: { backgroundColor: "#4ade80", color: "white" }
            });
            
            if (projectContext.details) {
                setProjectContext({
                    ...projectContext,
                    details: {
                        ...projectContext.details,
                        projectState: { 
                            ...projectContext.details.projectState, 
                            programId: programKeypair.toBase58() 
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Deployment error:', err);
            toast("Deployment error", {
                description: String(err),
                style: { backgroundColor: "#f87171", color: "white" }
            });
        } finally {
            setIsDeploying(false);
            setShowDeployModal(false);
        }
    };
    
    const nodesCount = projectContext?.details?.projectState?.nodes?.length || 0;
    const projectDeployed = !!projectContext?.details?.projectState?.deployed;
    const canGenerateCode = nodesCount > 0;
    const canDeploy = fileTree !== null || projectDeployed;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div
            className="app-sidebar w-[20%] flex flex-col h-full bg-[#121214] text-white border-r border-[#2a2a2d] overflow-hidden"
        >
            <div className="p-4 border-b border-[#2a2a2d]">
                <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-[#6e6e76] uppercase tracking-wider">PROJECT</div>
                    <div className="flex items-center space-x-2">
                        <button className="p-1 h-7 w-7 rounded-full hover:bg-[#2a2a2d] text-[#6e6e76] hover:text-white transition-colors">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1 h-7 w-7 rounded-full hover:bg-[#2a2a2d] text-[#6e6e76] hover:text-white transition-colors">
                            <Settings className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="flex items-center">
                        {isEditing ? (
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="bg-[#1e1e20] border border-[#2a2a2d] rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#4d7cfe] w-full"
                                autoFocus
                                onBlur={() => {
                                    setIsEditing(false);
                                    setProjectContext((prev) => ({
                                        ...prev,
                                        name: projectName
                                    }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setIsEditing(false);
                                        setProjectContext((prev) => ({
                                            ...prev,
                                            name: projectName
                                        }));
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <h3 className="text-lg font-semibold text-white">{projectName}</h3>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1 rounded-full hover:bg-[#2a2a2d] text-[#6e6e76] hover:text-white transition-colors"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mt-2 space-x-2 text-[#6e6e76] mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#4d7cfe]"></span>
                        <span className="text-xs">Token • Mint • Transfer</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button 
                            className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center"
                            onClick={handleOpenProjectClick}
                        >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            <span className="flex items-center">Open</span>
                        </button>
                        <button 
                            className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center"
                            onClick={handleSaveProject}
                            disabled={!projectContext.id}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            <span className="flex items-center">Save</span>
                        </button>
                        <button 
                            className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center"
                            onClick={handleNewProject}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="flex items-center">New</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#1e1e20] rounded-md mb-4">
                        <button
                            className={`h-9 rounded-md text-xs font-medium transition-all ${
                                activeChainTab === "on-chain"
                                    ? "bg-[#4d7cfe] text-white hover:bg-[#4d7cfe]/90"
                                    : "bg-transparent text-[#6e6e76] hover:bg-[#2a2a2d] hover:text-white"
                            }`}
                            onClick={() => handleTabChange("on-chain")}
                        >
                            On-Chain
                        </button>
                        <button
                            className={`h-9 rounded-md text-xs font-medium transition-all ${
                                activeChainTab === "off-chain"
                                    ? "bg-[#4d7cfe] text-white hover:bg-[#4d7cfe]/90"
                                    : "bg-transparent text-[#6e6e76] hover:bg-[#2a2a2d] hover:text-white"
                            }`}
                            onClick={() => handleTabChange("off-chain")}
                        >
                            Off-Chain
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center"
                            onClick={fileTree ? handleViewCode : handleGenerateClick}
                            disabled={!canGenerateCode}
                        >
                            {isGenerating ? (
                                <PulseLoader
                                    color="#80a3ff"
                                    size={3}
                                    cssOverride={{ display: 'inline-block', margin: '0' }}
                                />
                            ) : fileTree ? (
                                <Code className="h-4 w-4 mr-2 text-[#9de19f]" />
                            ) : (
                                <Code className="h-4 w-4 mr-2" />
                            )}
                            <span>Code</span>
                        </button>
                        <button className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center">
                            <Hammer className="h-4 w-4 mr-2" />
                            <span>Build</span>
                        </button>
                        <button 
                            className="cursor-pointer bg-[#1e1e20] border border-[#2a2a2d] hover:bg-[#2a2a2d] h-9 rounded-md text-xs font-medium flex items-center justify-center"
                            onClick={handleOpenDeployModal}
                            disabled={!canDeploy}
                        >
                            {isDeploying ? (
                                <PulseLoader
                                    color="#80a3ff"
                                    size={3}
                                    cssOverride={{ display: 'inline-block', margin: '0' }}
                                />
                            ) : projectContext.details?.projectState?.programId ? (
                                <Rocket className="h-4 w-4 mr-2 text-[#9de19f]" />
                            ) : (
                                <Rocket className="h-4 w-4 mr-2" />
                            )}
                            <span>Deploy</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[#2a2a2d]">
                <div className="relative">
                    <Search
                        className="absolute left-4 top-2 mt-[0.4px] h-3 w-3 text-[#6e6e76]"
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search instructions..."
                        className="w-full h-8 bg-[#1e1e20] border border-[#2a2a2d] rounded-lg pl-10 pr-10 py-2 text-xs text-gray-300 placeholder-[#6e6e76] focus:outline-none focus:ring-[#4d7cfe]"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />

                    {searchValue && (
                        <button
                            className="absolute right-3 top-2.5 text-[#6e6e76] hover:text-white transition-colors"
                            onClick={() => setSearchValue("")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {!searchValue && !isFocused && (
                        <div className="absolute right-3 top-2.5 text-[10px] text-[#6e6e76]">
                            Ctrl+F
                        </div>
                    )}
                </div>

                {isFocused && (
                    <div className="flex items-center justify-between mt-2 px-1 text-xs text-[#6e6e76]">
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 hover:text-white transition-colors">
                                <Filter className="h-3 w-3" />
                                <span>Filters</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-white transition-colors">
                                <Clock className="h-3 w-3" />
                                <span>Recent</span>
                            </button>
                        </div>
                        <button className="hover:text-white transition-colors">Advanced</button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {isExpanded && activeTab === 'workflow' && (
                    <NodeItems 
                        ref={nodeItemsRef}
                        activeChainTab={activeChainTab === "on-chain" ? "onChain" : "offChain"}
                    />
                )}
                {activeTab === 'interface' && (
                    <div className="p-4 text-[#6e6e76]">
                        {/* Interface-specific Toolbox content */}
                        <p>Interface Tab Toolbox Placeholder</p>
                    </div>
                )}
                {activeTab === 'code' && <FileTree />}
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-[#2a2a2d]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Documentation</span>
                    <button className="text-xs text-[#4d7cfe] hover:text-[#4d7cfe]/90 transition-colors">View All</button>
                </div>
                <div className="bg-[#1e1e20] border border-[#2a2a2d] rounded-md p-3 hover:border-[#2a2a2d] transition-all cursor-pointer group">
                    <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-[#4d7cfe] mr-2" />
                        <span className="text-xs font-medium text-white group-hover:text-white transition-colors">
                            Token Program Guide
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6e6e76] group-hover:text-[#6e6e76] transition-colors">
                        Learn how to create and manage tokens
                    </p>
                    <div className="mt-2 flex items-center text-xs text-[#4d7cfe] group-hover:text-[#4d7cfe]/90 transition-colors">
                        <span>Read more</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                </div>
            </div>

            {/* New Project Modal */}
            <NewProjectModal
                open={isNewProjectModalOpen}
                onOpenChange={setIsNewProjectModalOpen}
                onSubmit={handleCreateProject}
            />

            {/* Project List Modal */}
            <Dialog open={isProjectListModalOpen} onOpenChange={(open) => setIsProjectListModalOpen(open)}>
                <DialogContent className="bg-[#111827] text-slate-100" 
                style={{width: "fit-content", border: "1px solid rgb(36, 45, 68)"}}>
                    <ProjectListPopover
                        modalIsOpen={isProjectListModalOpen}
                        refreshTrigger={projectsRefreshCounter}
                        onProjectClick={(projectId, projectName) => {
                            handleOpenProject(projectId, projectContext, setProjectContext, setFileTree);
                            setIsProjectListModalOpen(false);
                        }}
                        closePopover={() => setIsProjectListModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            
            {/* Deploy Modal */}
            {showDeployModal && (
                <div
                    className="fixed top-0 left-0 w-[100vw] h-[100vh] z-[2000] flex justify-center items-center text-[14px]"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                >
                    <div
                        className="w-[20vw] h-[35vh] flex flex-col items-center justify-between relative p-[20px] rounded-[10px]"
                        style={{ backgroundColor: deployModalBg }}
                    >
                        <div className="flex flex-col justify-evenly items-center gap-2 h-full w-full">
                            <span>Select a deployment option:</span>

                            <div>
                                <div className="flex flex-row gap-[10px]">
                                    <input
                                        type="radio"
                                        name="deployOption"
                                        value="option1"
                                        checked={selectedOption === 'option1'}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                    />
                                    <span>User Wallet Control</span>
                                </div>

                                <div className="flex flex-row gap-[10px]">
                                    <input
                                        type="radio"
                                        name="deployOption"
                                        value="option2"
                                        checked={selectedOption === 'option2'}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                    />
                                    <span>Delegated Control</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row gap-[10px] w-full justify-between">
                            <Button
                                variant="ghost"
                                onClick={handleDeployCancel}
                                className="text-[14px] px-[5px] py-[10px] rounded-md border border-solid"
                                style={{
                                    borderColor: deployModalBorderColor,
                                    color: deployModalTextColor
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleDeployClick}
                                className="text-[14px] px-[5px] py-[10px] rounded-md border border-solid"
                                style={{
                                    borderColor: deployModalBorderColor,
                                    color: deployModalTextColor
                                }}
                            >
                                {isDeploying ? (
                                    <PulseLoader
                                        color="#fff"
                                        size={6}
                                        cssOverride={{ display: 'inline-block', margin: '0' }}
                                    />
                                ) : (
                                    "Confirm Deploy"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};