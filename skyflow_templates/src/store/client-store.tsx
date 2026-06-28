import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getClientTable, saveClientTable } from "@/services/client-service";
import type {
  ColumnType,
  TableColumn,
  TableData,
  TagColor,
} from "@/services/types";

/**
 * CLIENT TABLE STATE — single source of truth untuk tabel client (ala AFFiNE).
 * Komponen yang butuh data tabel WAJIB pakai useClientTable().
 */

type ClientTableContextValue = {
  data: TableData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // baris
  addRow: () => void;
  deleteRow: (rowId: string) => void;
  deleteRows: (rowIds: string[]) => void;
  moveRow: (fromIndex: number, toIndex: number) => void;
  setCell: (rowId: string, columnId: string, value: string) => void;
  // kolom
  addColumn: (type: ColumnType) => void;
  renameColumn: (columnId: string, name: string) => void;
  setColumnType: (columnId: string, type: ColumnType) => void;
  setColumnWidth: (columnId: string, width: number) => void;
  deleteColumn: (columnId: string) => void;
  // opsi select
  addOption: (columnId: string, label: string) => void;
  editOption: (
    columnId: string,
    optionId: string,
    patch: Partial<{ label: string; color: TagColor }>
  ) => void;
  deleteOption: (columnId: string, optionId: string) => void;
};

const EMPTY: TableData = { columns: [], rows: [] };
const ClientTableContext = createContext<ClientTableContextValue | null>(null);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const COLOR_CYCLE: TagColor[] = [
  "gray",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "red",
  "brown",
];

export function ClientProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TableData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getClientTable());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat tabel client");
    } finally {
      setLoading(false);
    }
  };

  // simpan ke backend (mock) dengan debounce agar tidak spam
  const persist = (next: TableData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveClientTable(next), 600);
  };

  const update = (fn: (prev: TableData) => TableData) =>
    setData((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });

  const addRow = () =>
    update((p) => ({
      ...p,
      rows: [...p.rows, { id: uid("row"), cells: {} }],
    }));

  const deleteRow = (rowId: string) =>
    update((p) => ({ ...p, rows: p.rows.filter((r) => r.id !== rowId) }));

  const deleteRows = (rowIds: string[]) =>
    update((p) => ({
      ...p,
      rows: p.rows.filter((r) => !rowIds.includes(r.id)),
    }));

  const moveRow = (fromIndex: number, toIndex: number) =>
    update((p) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= p.rows.length ||
        toIndex >= p.rows.length
      )
        return p;
      const rows = [...p.rows];
      const [moved] = rows.splice(fromIndex, 1);
      rows.splice(toIndex, 0, moved);
      return { ...p, rows };
    });

  const setCell = (rowId: string, columnId: string, value: string) =>
    update((p) => ({
      ...p,
      rows: p.rows.map((r) =>
        r.id === rowId ? { ...r, cells: { ...r.cells, [columnId]: value } } : r
      ),
    }));

  const addColumn = (type: ColumnType) => {
    const isSelectLike = type === "select" || type === "multi_select";
    update((p) => {
      const col: TableColumn = {
        id: uid("col"),
        name: isSelectLike ? "Pilihan" : "Kolom Baru",
        type,
        options: isSelectLike ? [] : undefined,
      };
      return { ...p, columns: [...p.columns, col] };
    });
  };

  const renameColumn = (columnId: string, name: string) =>
    update((p) => ({
      ...p,
      columns: p.columns.map((c) => (c.id === columnId ? { ...c, name } : c)),
    }));

  const setColumnType = (columnId: string, type: ColumnType) => {
    const isSelectLike = type === "select" || type === "multi_select";
    update((p) => ({
      ...p,
      columns: p.columns.map((c) =>
        c.id === columnId
          ? {
              ...c,
              type,
              options: isSelectLike ? c.options ?? [] : undefined,
            }
          : c
      ),
    }));
  };

  const setColumnWidth = (columnId: string, width: number) =>
    update((p) => ({
      ...p,
      columns: p.columns.map((c) =>
        c.id === columnId ? { ...c, width: Math.max(80, Math.round(width)) } : c
      ),
    }));

  const deleteColumn = (columnId: string) =>
    update((p) => ({
      ...p,
      columns: p.columns.filter((c) => c.id !== columnId),
      rows: p.rows.map((r) => {
        const cells = { ...r.cells };
        delete cells[columnId];
        return { ...r, cells };
      }),
    }));

  const addOption = (columnId: string, label: string) =>
    update((p) => ({
      ...p,
      columns: p.columns.map((c) => {
        if (c.id !== columnId || c.type !== "select") return c;
        const options = c.options ?? [];
        const color = COLOR_CYCLE[options.length % COLOR_CYCLE.length];
        return {
          ...c,
          options: [...options, { id: uid("opt"), label, color }],
        };
      }),
    }));

  const editOption = (
    columnId: string,
    optionId: string,
    patch: Partial<{ label: string; color: TagColor }>
  ) =>
    update((p) => ({
      ...p,
      columns: p.columns.map((c) =>
        c.id === columnId && c.options
          ? {
              ...c,
              options: c.options.map((o) =>
                o.id === optionId ? { ...o, ...patch } : o
              ),
            }
          : c
      ),
    }));

  const deleteOption = (columnId: string, optionId: string) =>
    update((p) => ({
      ...p,
      columns: p.columns.map((c) =>
        c.id === columnId && c.options
          ? { ...c, options: c.options.filter((o) => o.id !== optionId) }
          : c
      ),
      // kosongkan sel yang memakai opsi terhapus
      rows: p.rows.map((r) =>
        r.cells[columnId] === optionId
          ? { ...r, cells: { ...r.cells, [columnId]: "" } }
          : r
      ),
    }));

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <ClientTableContext.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        addRow,
        deleteRow,
        deleteRows,
        moveRow,
        setCell,
        addColumn,
        renameColumn,
        setColumnType,
        setColumnWidth,
        deleteColumn,
        addOption,
        editOption,
        deleteOption,
      }}
    >
      {children}
    </ClientTableContext.Provider>
  );
}

export function useClientTable() {
  const ctx = useContext(ClientTableContext);
  if (!ctx)
    throw new Error("useClientTable harus dipakai di dalam ClientProvider");
  return ctx;
}
