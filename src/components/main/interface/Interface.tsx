import React, { useContext, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useColorModeValue } from '@/components/ui/color-mode';
import '@/styles/interface/interfaceStyle.css';
import ProjectContext from "@/context/project/ProjectContext";
import { projectApi } from '@/api/projectApi';

const Interface = () => {
    const { projectContext, setProjectContext } = useContext(ProjectContext);
    const { id: projectId, containerUrl } = projectContext;
    
    const [isRefreshing, setIsRefreshing] = useState(false);

    const canvasBorder = useColorModeValue('var(--workflow-canvas-border-light)', 'var(--workflow-canvas-border-dark)');

    const handleRefreshContainerUrl = async () => {
        if (!projectId || isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            const updatedProject = await projectApi.getProjectDetails(projectId);
            
            if (updatedProject.containerUrl) {
                const updatedContext = {
                    ...projectContext,
                    containerUrl: updatedProject.containerUrl
                };
                
                setProjectContext(updatedContext);
            } else {
                console.warn("No containerUrl found after refresh attempt");
            }
        } catch (error) {
            console.error("Error refreshing project details:", error);
        } finally {
            console.log(`Container URL refresh completed`);
            setIsRefreshing(false);
        }
    };

    return (
        <div className="relative w-full h-full">
            {containerUrl ? (
                <div className="w-full h-full">
                    <iframe
                        src={containerUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="clipboard-read; clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        title="Ephemeral Container"
                    />
                </div>
            ) : (
                <div
                    className="flex flex-col items-center justify-center w-full h-full"
                    style={{ backgroundColor: "var(--background-dark)" }}
                >
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-lg text-gray-400 mb-4">
                        Waiting for container URL...
                    </p>
                    <p className="text-sm text-gray-500 mb-4 max-w-[80%] text-center">
                        The container URL should be available automatically after project creation.
                        If it's taking too long, you can try refreshing.
                    </p>
                    <Button 
                        onClick={handleRefreshContainerUrl} 
                        disabled={isRefreshing}
                        variant="outline"
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                    >
                        {isRefreshing ? "Refreshing..." : "Refresh Container"}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Interface;