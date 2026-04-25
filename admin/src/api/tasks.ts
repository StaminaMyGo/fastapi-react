import apiClient from "./client";

export interface TaskItem {
  id: number;
  name: string;
  description: string | null;
  status: string;
  deadline: string;
  start_date: string;
  end_date: string;
  min_slots_per_member: number;
  max_slots_per_member: number;
  created_by: number;
  created_at: string;
}

export const getTasksApi = async (): Promise<TaskItem[]> => {
  const res = await apiClient.get("/tasks");
  return res.data;
};

export const getTaskDetailApi = async (taskId: number): Promise<TaskItem & { slots: unknown[] }> => {
  const res = await apiClient.get(`/tasks/${taskId}`);
  return res.data;
};
