import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  FileText,
  Layers,
  Users,
  CalendarDays,
  ListTodo,
  Moon,
  Sun,
  Briefcase,
  Wallet,
  AlertCircle,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/store/theme-store";

type CmdItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Buka dengan Ctrl+/ (atau Cmd+/)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const go = (path: string) => () => {
    navigate(path);
    setOpen(false);
  };

  const items: CmdItem[] = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Navigasi", run: go("/") },
      { id: "projects", label: "List Project", icon: Briefcase, group: "Navigasi", keywords: "project kerjaan proyek", run: go("/projects") },
      { id: "solo-projects", label: "Project Solo", icon: User, group: "Navigasi", keywords: "solo dewekan", run: go("/solo-projects") },
      { id: "payment", label: "Keuangan & Invoice", icon: Wallet, group: "Navigasi", keywords: "uang duit payment finance", run: go("/payment") },
      { id: "clients", label: "List Client", icon: Users, group: "Navigasi", keywords: "klien customer", run: go("/clients") },
      { id: "documents", label: "Dokumen", icon: FileText, group: "Navigasi", keywords: "document file pdf", run: go("/documents") },
      { id: "templates", label: "Template", icon: Layers, group: "Navigasi", keywords: "invoice perjanjian bukti", run: go("/templates") },
      { id: "revisions", label: "List Revisi", icon: AlertCircle, group: "Navigasi", keywords: "revisi perbaikan bug", run: go("/revisions") },
      { id: "maintenance", label: "Maintenance", icon: ShieldCheck, group: "Navigasi", keywords: "maintenance biaya langganan bulanan", run: go("/maintenance") },
      { id: "calendar", label: "Kalender", icon: CalendarDays, group: "Navigasi", keywords: "event jadwal", run: go("/calendar") },
      { id: "activities", label: "Aktivitas", icon: ListTodo, group: "Navigasi", keywords: "todo planner tugas", run: go("/activities") },
      { id: "settings", label: "Pengaturan Akun", icon: Settings, group: "Navigasi", keywords: "setting akun profil password", run: go("/settings") },
      {
        id: "theme",
        label: theme === "dark" ? "Mode Terang" : "Mode Gelap",
        icon: theme === "dark" ? Sun : Moon,
        group: "Aksi",
        keywords: "theme dark light tema",
        run: () => {
          toggleTheme();
          setOpen(false);
        },
      },
    ],
    [theme] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  // reset state saat dibuka / query berubah
  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  // grup → items (mempertahankan urutan)
  const groups = useMemo(() => {
    const map = new Map<string, CmdItem[]>();
    filtered.forEach((it) => {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    });
    return [...map.entries()];
  }, [filtered]);

  // index global untuk highlight
  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-text/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari menu & aksi…"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-text/40"
          />
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-text/50">
              Ctrl
            </kbd>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-text/50">
              /
            </kbd>
          </div>
        </div>

        {/* List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-base text-text/50">
              Tidak ada hasil.
            </p>
          )}
          {groups.map(([group, groupItems]) => (
            <div key={group} className="mb-1">
              <p className="px-2 py-1.5 text-sm font-bold text-text/50">
                {group}
              </p>
              {groupItems.map((it) => {
                runningIndex += 1;
                const idx = runningIndex;
                const Icon = it.icon;
                return (
                  <button
                    key={it.id}
                    onClick={it.run}
                    onMouseEnter={() => setActive(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-base transition-colors",
                      active === idx
                        ? "bg-primary/15 text-primary"
                        : "text-text hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {it.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
