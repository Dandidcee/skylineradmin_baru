import type { TableData } from "./types";
import { fetchApi } from "./api";

const INITIAL_TABLE: TableData = {
  columns: [
    { id: "name", name: "Nama Client", type: "text" },
    { id: "company", name: "Perusahaan", type: "text" },
    { id: "address", name: "Alamat", type: "text" },
    { id: "phone", name: "No HP", type: "text" },
  ],
  rows: [],
};

export async function getClients(): Promise<any[]> {
  try {
    return await fetchApi('/clients');
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export async function getClientTable(): Promise<TableData> {
  try {
    const clients = await fetchApi('/clients');
    return {
      columns: INITIAL_TABLE.columns,
      rows: clients.map((c: any) => ({
        id: c.id,
        cells: {
          name: c.name || '',
          company: c.company || '',
          address: c.address || '',
          phone: c.phone || '',
        }
      }))
    };
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return { columns: INITIAL_TABLE.columns, rows: [] };
  }
}

export async function saveClientTable(data: TableData): Promise<TableData> {
  return data;
}

export async function createClient(data: any): Promise<any> {
  return await fetchApi('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: any): Promise<any> {
  return await fetchApi(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await fetchApi(`/clients/${id}`, {
    method: 'DELETE',
  });
}
