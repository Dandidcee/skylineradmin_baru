import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { listTodos, saveTodos } from "@/services/todo-service";
import type { TodoItem } from "@/services/types";

/**
 * TODO STATE — single source of truth untuk todo/aktivitas mingguan.
 * Komponen WAJIB pakai useTodos().
 */

type TodoContextValue = {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
  refresh: (isBackground?: boolean) => Promise<void>;
  addTodo: (day: string, text: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  moveTodo: (id: string, day: string) => void;
  removeTodo: (id: string) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);
const uid = () => `td-${Math.random().toString(36).slice(2, 8)}`;

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      setTodos(await listTodos());
    } catch (e) {
      if (!isBackground) setError(e instanceof Error ? e.message : "Gagal memuat todo");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const persist = (next: TodoItem[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveTodos(next), 600);
  };

  const update = (fn: (prev: TodoItem[]) => TodoItem[]) =>
    setTodos((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });

  const addTodo = (day: string, text: string) =>
    update((p) => [...p, { id: uid(), day, text, done: false }]);

  const toggleTodo = (id: string) =>
    update((p) =>
      p.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const editTodo = (id: string, text: string) =>
    update((p) => p.map((t) => (t.id === id ? { ...t, text } : t)));

  const moveTodo = (id: string, day: string) =>
    update((p) => p.map((t) => (t.id === id ? { ...t, day } : t)));

  const removeTodo = (id: string) =>
    update((p) => p.filter((t) => t.id !== id));

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => {
      void refresh(true);
    }, 30000); // Auto refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        error,
        refresh,
        addTodo,
        toggleTodo,
        editTodo,
        moveTodo,
        removeTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos harus dipakai di dalam TodoProvider");
  return ctx;
}
