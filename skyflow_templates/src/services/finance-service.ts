import { fetchApi } from "./api";

export type Finance = {
  id: string;
  type: string;
  amount: number;
  status: string;
  projectId?: string;
  project?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getFinances(): Promise<Finance[]> {
  return await fetchApi('/finances');
}

export async function createFinance(data: Partial<Finance>): Promise<Finance> {
  return await fetchApi('/finances', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFinance(id: string, data: Partial<Finance>): Promise<Finance> {
  return await fetchApi(`/finances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFinance(id: string): Promise<void> {
  await fetchApi(`/finances/${id}`, {
    method: 'DELETE',
  });
}
