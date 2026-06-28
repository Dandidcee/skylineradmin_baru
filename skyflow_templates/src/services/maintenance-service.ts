import { fetchApi } from "./api";

export interface MaintenanceCost {
  id: string;
  name: string;
  amount: number;
  type: string;
  notes?: string;
  status: string;
  nextDueDate: string;
  projectId: string;
  createdAt: string;
}

export async function createMaintenanceCost(data: Partial<MaintenanceCost>): Promise<MaintenanceCost> {
  return fetchApi("/api/maintenance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMaintenanceCost(id: string, data: Partial<MaintenanceCost>): Promise<MaintenanceCost> {
  return fetchApi(`/api/maintenance/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMaintenanceCost(id: string): Promise<void> {
  return fetchApi(`/api/maintenance/${id}`, {
    method: "DELETE",
  });
}
