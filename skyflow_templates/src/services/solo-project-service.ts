import { fetchApi } from "./api";

export type SoloProject = {
  id: string;
  bossName: string;
  projectName: string;
  paymentAmount: number;
  debtAmount: number;
  progress: number;
  createdAt: string;
};

export async function getSoloProjects(): Promise<SoloProject[]> {
  return await fetchApi('/solo-projects');
}

export async function createSoloProject(data: Partial<SoloProject>): Promise<SoloProject> {
  return await fetchApi('/solo-projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSoloProject(id: string, data: Partial<SoloProject>): Promise<SoloProject> {
  return await fetchApi(`/solo-projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSoloProject(id: string): Promise<void> {
  await fetchApi(`/solo-projects/${id}`, {
    method: 'DELETE',
  });
}
