import React, { useState, useContext, useEffect } from 'react';
import ProjectContext from '@/context/project/ProjectContext';
import FileContext from '@/context/file/FileContext';
import UxContext from '@/context/ux/UxContext';
import { handleConfirmNewProject, handleOpenProject, handleSaveClick } from '@/utils/project/projectUtils';
import { Tooltip } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuSave, LuPlus } from "react-icons/lu";
import { FaRegFolderOpen } from "react-icons/fa";
import ProjectListPopover from './workflow/ProjectListPopover';
import '@/styles/toolbar/ToolbarStyle.css';
import { useColorModeValue } from '@/components/ui/color-mode';
import { NewProjectModal } from '@/components/ui/new-project-modal';

export const ProjectInfo: React.FC = () => {
    const { projectContext, setProjectContext } = useContext(ProjectContext);
    const { fileTree, setFileTree, setSelectedFile } = useContext(FileContext);
    const { setUxOpenPanel } = useContext(UxContext);
    const [projectsRefreshCounter, setProjectsRefreshCounter] = useState(0);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [isProjectListModalOpen, setIsProjectListModalOpen] = useState(false);

    const buttonTextColor = useColorModeValue('var(--toolbar-button-text-light)', 'var(--toolbar-button-text-dark)');

    useEffect(() => {
        console.log('ProjectContext:', projectContext);
    }, [projectContext]);

    const handleNewProjectToggle = () => {
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

    const handleOpenProjectClick = async () => {
        setIsProjectListModalOpen(true);
    };

    return (
        <div className="flex flex-1 flex-row justify-between w-full items-center p-[10px_25px] gap-[30px] text-[10px]"
            style={{ 
                backgroundColor: "var(--foreground-dark)",
                borderBottom: "1px solid var(--border-2-dark)" 
            }}
        >
            <div className="flex flex-row gap-[20px] items-center justify-between min-w-[250px] w-full">
                <div className="flex flex-row gap-[20px] items-center justify-center">
                    {/* New Project Button */}
                    <Tooltip content="New Project">
                        <Button
                            variant="ghost"
                            onClick={handleNewProjectToggle}
                            className="flex items-center justify-center gap-[10px] text-sm rounded-md"
                            style={{ color: buttonTextColor }}
                        >
                            <LuPlus size={18} />
                            <span>New</span>
                        </Button>
                    </Tooltip>

                    {/* Open Project Button */}
                    <Tooltip content="Open Project">
                        <Button
                            variant="ghost"
                            onClick={handleOpenProjectClick}
                            className="flex items-center justify-center gap-[10px] text-sm rounded-md"
                            style={{ color: buttonTextColor }}
                        >
                            <FaRegFolderOpen size={18} />
                            <span>Open</span>
                        </Button>
                    </Tooltip>

                    {/* Save Project Button */}
                    <Tooltip content="Save Project">
                        <Button
                            variant="ghost"
                            onClick={() => handleSaveClick(projectContext, setProjectContext, projectsRefreshCounter, setProjectsRefreshCounter)}
                            className="flex items-center justify-center gap-[10px] text-sm rounded-md"
                            style={{ color: buttonTextColor }}
                            disabled={!projectContext.id}
                        >
                            <LuSave size={18} />
                            <span>Save</span>
                        </Button>
                    </Tooltip>
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
                <DialogContent className="bg-[#111827] text-slate-100 " 
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
        </div>
    );
};
