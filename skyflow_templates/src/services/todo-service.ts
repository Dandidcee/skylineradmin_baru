import type { TodoItem } from "./types";
import { fetchApi } from "./api";

/**
 * TODO SERVICE — sumber data todo/aktivitas mingguan.
 * Saat ini mock. Ganti isi fungsi dengan fetch/persist ke backend (N8N).
 *
 * Daftar API:
 *  - listTodos(): ambil semua todo
 *  - saveTodos(todos): simpan semua todo (placeholder)
 */

export async function listTodos(): Promise<TodoItem[]> {
  try {
    return await fetchApi('/todos');
  } catch (error) {
    return [];
  }
}

export async function saveTodos(todos: TodoItem[]): Promise<TodoItem[]> {
  return todos; // Simplification for now
}
