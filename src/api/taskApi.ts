import { api } from './apiHelper';

interface Task {
  id: string;
  name: string;
  created_at: string;
  last_updated: string;
  status: 'queued' | 'doing' | 'finished' | 'failed' | 'succeed' | 'warning';
  project_id: string;
  project_name: string;
  result?: string;
}

interface ListTasksResponse {
  tasks: {
    data: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: 'queued' | 'doing' | 'finished' | 'failed' | 'succeed' | 'warning';
  projectId?: string;
}

export const taskApi = {
  listProjectTasks: async (
    params: TaskQueryParams = {}
  ): Promise<ListTasksResponse> => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error listing project tasks:', error);
      throw error;
    }
  },

  getTask: async (taskId: string): Promise<{ task: Task }> => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  },
};
