import { fetchApi } from './api';

export interface Credential {
  id: string;
  name: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  clientId?: string;
  projectId?: string;
  createdAt: string;
  client?: unknown;
  project?: unknown;
}

export const getCredentials = async (): Promise<Credential[]> => {
  return fetchApi('/credentials');
};

export const createCredential = async (data: Partial<Credential>): Promise<Credential> => {
  return fetchApi('/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCredential = async (id: string, data: Partial<Credential>): Promise<Credential> => {
  return fetchApi(`/credentials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCredential = async (id: string): Promise<void> => {
  return fetchApi(`/credentials/${id}`, {
    method: 'DELETE',
  });
};
