import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listDocuments } from "@/services/document-service";
import type { DocumentItem } from "@/services/types";

/**
 * DOCUMENT STATE — single source of truth untuk daftar dokumen.
 * Semua komponen yang butuh data dokumen WAJIB pakai useDocuments().
 * Jangan fetch atau simpan daftar dokumen di komponen lain.
 */

type DocumentContextValue = {
  documents: DocumentItem[];
  loading: boolean;
  error: string | null;
  refresh: (isBackground?: boolean) => Promise<void>;
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (e) {
      if (!isBackground) setError(e instanceof Error ? e.message : "Gagal memuat dokumen");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => {
      void refresh(true);
    }, 30000); // Auto refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <DocumentContext.Provider value={{ documents, loading, error, refresh }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx)
    throw new Error("useDocuments harus dipakai di dalam DocumentProvider");
  return ctx;
}
