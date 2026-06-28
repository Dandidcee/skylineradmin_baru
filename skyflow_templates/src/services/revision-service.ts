import { fetchApi } from "./api";

export interface Revision {
  id: string;
  title: string;
  description: string | null;
  isDone: boolean;
  projectId: string;
  createdAt: string;
}

export async function getRevisions(): Promise<Revision[]> {
  try {
    return await fetchApi('/revisions');
  } catch (error) {
    console.error('Failed to fetch revisions:', error);
    return [];
  }
}

export async function createRevision(data: Partial<Revision>): Promise<Revision> {
  return await fetchApi('/revisions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRevision(id: string, data: Partial<Revision>): Promise<Revision> {
  return await fetchApi(`/revisions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRevision(id: string): Promise<void> {
  await fetchApi(`/revisions/${id}`, {
    method: 'DELETE',
  });
}
