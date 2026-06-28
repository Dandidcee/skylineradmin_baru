import { useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  parseISO,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  MonthView,
  WeekView,
  DayView,
} from "@/components/calendar/calendar-views";
import { EventDialog } from "@/components/calendar/event-dialog";
import { useCalendar } from "@/store/calendar-store";
import type { CalendarEvent } from "@/services/types";

type ViewMode = "month" | "week" | "day";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "month", label: "Bulan" },
  { id: "week", label: "Minggu" },
  { id: "day", label: "Hari" },
];

export function CalendarPage() {
  const { events, loading } = useCalendar();
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>();

  const openNew = (iso?: string) => {
    setEditing(null);
    setDefaultDate(iso ?? format(current, "yyyy-MM-dd"));
    setDialogOpen(true);
  };
  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setDialogOpen(true);
  };

  const step = (dir: 1 | -1) => {
    setCurrent((d) =>
      view === "month"
        ? addMonths(d, dir)
        : view === "week"
        ? addWeeks(d, dir)
        : addDays(d, dir)
    );
  };

  const label =
    view === "day"
      ? format(current, "d MMMM yyyy", { locale: idLocale })
      : format(current, "MMMM yyyy", { locale: idLocale });

  return (
    <AppLayout title="Kalender">
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="Sebelumnya">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Berikutnya">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())}>
              Hari ini
            </Button>
            <h2 className="ml-1 font-heading text-xl font-bold capitalize">
              {label}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex rounded-md border p-0.5">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={
                    "rounded px-3 py-1 text-sm transition-colors " +
                    (view === v.id
                      ? "bg-primary text-primary-foreground"
                      : "text-text/60 hover:text-text")
                  }
                >
                  {v.label}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => openNew()}>
              <Plus className="h-4 w-4" />
              Event
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-base text-text/60">Memuat kalender...</p>
        ) : view === "month" ? (
          <MonthView
            current={current}
            events={events}
            onSelectDate={openNew}
            onSelectEvent={openEdit}
          />
        ) : view === "week" ? (
          <WeekView
            current={current}
            events={events}
            onSelectDate={openNew}
            onSelectEvent={openEdit}
          />
        ) : (
          <DayView
            current={current}
            events={events}
            onSelectEvent={openEdit}
          />
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        defaultDate={defaultDate}
      />
    </AppLayout>
  );
}

export { parseISO };
