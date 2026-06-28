import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { listEvents, saveEvents } from "@/services/calendar-service";
import type { CalendarEvent } from "@/services/types";

/**
 * CALENDAR STATE — single source of truth untuk event kalender.
 * Komponen yang butuh data event WAJIB pakai useCalendar().
 */

type CalendarContextValue = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refresh: (isBackground?: boolean) => Promise<void>;
  upsertEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      setEvents(await listEvents());
    } catch (e) {
      if (!isBackground) setError(e instanceof Error ? e.message : "Gagal memuat kalender");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const persist = (next: CalendarEvent[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveEvents(next), 600);
  };

  const upsertEvent = (event: CalendarEvent) =>
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      const next = exists
        ? prev.map((e) => (e.id === event.id ? event : e))
        : [...prev, event];
      persist(next);
      return next;
    });

  const deleteEvent = (id: string) =>
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persist(next);
      return next;
    });

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => {
      void refresh(true);
    }, 30000); // Auto refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <CalendarContext.Provider
      value={{ events, loading, error, refresh, upsertEvent, deleteEvent }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar harus dipakai di dalam CalendarProvider");
  return ctx;
}
