import { taskApi } from "@/api/taskApi";

export const pollTaskStatus = async (
    taskId: string,
    interval: number = 1000,
    maxTries: number = 20
  ): Promise<any> => {
    let attemptCount = 0;
  
    while (attemptCount < maxTries) {
      attemptCount++;
  
      try {
        const taskData = await taskApi.getTask(taskId);
        const { status, result } = taskData.task;
  
        if (status === 'succeed') {
          return JSON.parse(result || '{}');
        } else if (status === 'failed') {
          throw new Error('Task failed on the backend.');
        } else if (status === 'queued' || status === 'doing') {
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    }
  
    throw new Error('Polling timed out. Task did not complete in time.');
};

export const pollTaskStatus2 = async (
  taskId: string,
  interval: number = 1000,
  maxTries: number = 20
): Promise<any> => {
  let attemptCount = 0;

  while (attemptCount < maxTries) {
    attemptCount++;

    try {
      const taskData = await taskApi.getTask(taskId);
      const { status, result } = taskData.task;

      if (status === 'succeed') {
        return result;
      } else if (status === 'failed') {
        throw new Error('Task failed on the backend.');
      } else if (status === 'queued' || status === 'doing') {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  }

  throw new Error('Polling timed out. Task did not complete in time.');
};


export const pollTaskStatus3 = async (
  taskId: string,
  interval: number = 1000,
): Promise<any> => {
  let attemptCount = 0;
  console.log(`[DEBUG_TASK] Starting pollTaskStatus3 for taskId=${taskId}`);

  while (true) {
    attemptCount++;
    console.log(`[DEBUG_TASK] pollTaskStatus3 attempt #${attemptCount} for taskId=${taskId}`);

    try {
      const taskData = await taskApi.getTask(taskId);
      console.log(`[DEBUG_TASK] pollTaskStatus3 response for attempt #${attemptCount}:`, taskData);
      const { status, result } = taskData.task;
      console.log(`[DEBUG_TASK] Task status: ${status} for taskId=${taskId} on attempt #${attemptCount}`);

      if (status === 'succeed' || status === 'finished' || status === 'warning') {
        console.log(`[DEBUG_TASK] Task complete with status=${status} for taskId=${taskId} after ${attemptCount} attempts`);
        return taskData;
      } else if (status === 'failed') {
        console.error(`[DEBUG_TASK] Task failed with status=${status} for taskId=${taskId} after ${attemptCount} attempts. Error: ${result}`);
        throw new Error(`Task failed on the backend: ${result || 'No error details provided'}`);
      } else if (status === 'queued' || status === 'doing') {
        console.log(`[DEBUG_TASK] Task still in progress (${status}), waiting ${interval}ms before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    } catch (error) {
      console.error(`[DEBUG_TASK] Polling error for taskId=${taskId} on attempt #${attemptCount}:`, error);
      throw error;
    }
  }
};

export const pollTaskStatus4 = async (
  taskId: string,
  interval = 1000
): Promise<string> => {
  let attemptCount = 0;
  console.log(`[DEBUG_TASK] Starting pollTaskStatus4 for taskId=${taskId}`);

  while (true) {
    attemptCount++;
    console.log(`[DEBUG_TASK] pollTaskStatus4 attempt #${attemptCount} for taskId=${taskId}`);

    try {
      const taskData = await taskApi.getTask(taskId);
      console.log(`[DEBUG_TASK] pollTaskStatus4 response for attempt #${attemptCount}:`, taskData);
      const { status, result } = taskData.task;
      console.log(`[DEBUG_TASK] Task status: ${status} for taskId=${taskId} on attempt #${attemptCount}`);

      if (status === 'failed') {
        console.error(`[DEBUG_TASK] Task failed with status=${status} for taskId=${taskId} after ${attemptCount} attempts. Error: ${result}`);
        return status;
      }
      
      if (
        status === 'succeed' ||
        status === 'finished'
      ) {
        console.log(`[DEBUG_TASK] Task complete with status=${status} for taskId=${taskId} after ${attemptCount} attempts`);
        return status;
      }

      if (status === 'warning') {
        console.log(`[DEBUG_TASK] Task has warning status, but continuing to poll for final status...`);
        return status;
      }

      console.log(`[DEBUG_TASK] Task still in progress (${status}), waiting ${interval}ms before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`[DEBUG_TASK] Polling error for taskId=${taskId} on attempt #${attemptCount}:`, error);
      throw error;
    }
  }
};
