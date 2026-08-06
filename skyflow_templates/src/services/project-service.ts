import { fetchApi } from "./api";

export interface Project {
  id: string;
  name: string;
  price: string;
  status: string; // pending, in_progress, done, canceled
  clientId: string;
  client?: unknown; // To hold related client data
  progressPercentage?: number;
  maintenanceFee?: string;
  maxRevisions?: number;
  revisions?: unknown[]; // Array of Revision
  maintenanceCosts?: unknown[]; // Array of MaintenanceCost
  finances?: unknown[];
  createdAt: string;
}

export async function getProjects(): Promise<Project[]> {
  try {
    return await fetchApi('/projects');
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  return await fetchApi('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return await fetchApi(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await fetchApi(`/projects/${id}`, {
    method: 'DELETE',
  });
}
