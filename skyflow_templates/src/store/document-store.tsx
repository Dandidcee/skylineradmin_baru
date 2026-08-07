import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { listDocuments } from "@/services/document-service";
import type { DocumentItem } from "@/services/types";

/**
 * DOCUMENT STATE — single source of truth untuk daftar dokumen.
 * 
 * Strategi: Stale-While-Revalidate
 *   1. Saat pertama kali buka, langsung tampilkan data dari localStorage (instant)
 *   2. Di background, fetch ke server untuk cek apakah ada yang baru/berubah
 *   3. Jika ada perubahan, update tampilan dan simpan ke localStorage
 * 
 * CATATAN: Hanya metadata dokumen yang di-cache (id, title, status, dll).
 * fileUrl (HTML besar) tidak di-cache localStorage untuk menghindari penuhnya storage.
 */

const CACHE_KEY = 'skyflow_documents_cache';
const CACHE_VERSION = 'v1';

type CacheEntry = {
  version: string;
  timestamp: number;
  // Simpan metadata saja, tanpa fileUrl
  data: Omit<DocumentItem, 'fileUrl'>[];
};

function readCache(): Omit<DocumentItem, 'fileUrl'>[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.version !== CACHE_VERSION) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: Omit<DocumentItem, 'fileUrl'>[]) {
  try {
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage penuh — tidak masalah, skip
  }
}

function stripFileUrl(docs: DocumentItem[]): Omit<DocumentItem, 'fileUrl'>[] {
  return docs.map(({ fileUrl: _f, ...rest }) => rest);
}

type DocumentContextValue = {
  documents: DocumentItem[];
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  refresh: (isBackground?: boolean) => Promise<void>;
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    // Langsung load dari cache saat inisialisasi — ZERO loading time
    const cached = readCache();
    return (cached as DocumentItem[]) ?? [];
  });
  const [loading, setLoading] = useState(() => {
    // Hanya loading kalau tidak ada cache
    return readCache() === null;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  const refresh = async (isBackground = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (!isBackground) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError(null);

    try {
      const data = await listDocuments();

      // Cek apakah ada perubahan dengan membandingkan JSON ringkas (tanpa fileUrl)
      const stripped = stripFileUrl(data);
      const currentStripped = stripFileUrl(documents);
      const hasChanges = JSON.stringify(stripped) !== JSON.stringify(currentStripped);

      if (hasChanges || !isBackground) {
        setDocuments(data);
        writeCache(stripped);
      }
    } catch (e) {
      if (!isBackground) {
        setError(e instanceof Error ? e.message : "Gagal memuat dokumen");
      }
      // Background fetch gagal → tidak masalah, tetap tampilkan cache
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const cached = readCache();
    if (cached !== null) {
      // Ada cache → langsung tampilkan, lalu background sync
      void refresh(true);
    } else {
      // Tidak ada cache → fetch biasa dengan loading indicator
      void refresh(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DocumentContext.Provider value={{ documents, loading, isSyncing, error, refresh }}>
      {children}
    </DocumentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx)
    throw new Error("useDocuments harus dipakai di dalam DocumentProvider");
  return ctx;
}
