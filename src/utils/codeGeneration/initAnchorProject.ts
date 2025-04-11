import { projectApi } from '@/api/projectApi';
import { toaster } from '@/components/ui/toaster';
import { ProjectContextType } from '@/context/project/ProjectContextTypes';
import { TaskResponse } from '@/api/interfaces/Task';

export const initAnchorProject = async (
    projectContext: ProjectContextType,
): Promise<TaskResponse | undefined> => {
    try {
        const taskId = await projectApi.initAnchorProject(projectContext.id || '', projectContext.name || '');
        return taskId;

    } catch (error) {
        console.error('Error initializing Anchor project:', error);

        toaster.create({
            title: 'Error initializing Anchor project',
            description: 'An error occurred while generating your Anchor project.',
            type: 'error',
        });
        return undefined;
    }
};