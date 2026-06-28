import { fetchApi } from "./api";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId?: string;
  project?: any;
  assigneeId?: string;
  assignee?: any;
  createdAt: string;
  updatedAt: string;
};

export async function getTasks(): Promise<Task[]> {
  return await fetchApi('/tasks');
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  return await fetchApi('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  return await fetchApi(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await fetchApi(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
