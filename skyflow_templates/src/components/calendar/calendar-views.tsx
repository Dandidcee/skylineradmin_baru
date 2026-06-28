import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { tagStyle } from "@/components/clients/tag-colors";
import type { CalendarEvent } from "@/services/types";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Event yang jatuh pada hari tertentu (dukung rentang date..endDate). */
function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const d = format(day, "yyyy-MM-dd");
  return events
    .filter((e) => {
      const start = e.date;
      const end = e.endDate ?? e.date;
      return d >= start && d <= end;
    })
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    });
}

function EventChip({
  event,
  onClick,
  compact = false,
}: {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={tagStyle(event.color)}
      className={cn(
        "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-sm leading-tight",
        compact && "py-1"
      )}
      title={event.title}
    >
      {!event.allDay && event.startTime && (
        <span className="shrink-0 opacity-70">{event.startTime}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  );
}

/* ── MONTH ── */
export function MonthView({
  current,
  events,
  onSelectDate,
  onSelectEvent,
}: {
  current: Date;
  events: CalendarEvent[];
  onSelectDate: (iso: string) => void;
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* weekday header */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-sm font-bold text-text/50">
            {w}
          </div>
        ))}
      </div>
      {/* grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const inMonth = isSameMonth(day, current);
          const today = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(format(day, "yyyy-MM-dd"))}
              className={cn(
                "min-h-[7rem] cursor-pointer border-b border-r p-1.5 transition-colors hover:bg-muted/30 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/20 text-text/30"
              )}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    today && "bg-primary text-primary-foreground font-bold"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelectEvent(e);
                    }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-sm text-text/50">
                    +{dayEvents.length - 3} lagi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── WEEK ── */
export function WeekView({
  current,
  events,
  onSelectDate,
  onSelectEvent,
}: {
  current: Date;
  events: CalendarEvent[];
  onSelectDate: (iso: string) => void;
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const start = startOfWeek(current, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7 sm:gap-2">
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day);
        const today = isSameDay(day, new Date());
        return (
          <div
            key={day.toISOString()}
            className="flex flex-col rounded-lg border bg-card"
          >
            <button
              onClick={() => onSelectDate(format(day, "yyyy-MM-dd"))}
              className={cn(
                "flex items-center justify-between border-b px-2 py-2 text-left hover:bg-muted/30",
                today && "bg-primary/10"
              )}
            >
              <span className="text-sm text-text/60">
                {format(day, "EEE", { locale: idLocale })}
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                  today && "bg-primary text-primary-foreground font-bold"
                )}
              >
                {format(day, "d")}
              </span>
            </button>
            <div className="flex min-h-[6rem] flex-col gap-1 p-1.5">
              {dayEvents.length === 0 && (
                <span className="px-1 text-sm text-text/30">—</span>
              )}
              {dayEvents.map((e) => (
                <EventChip
                  key={e.id}
                  event={e}
                  compact
                  onClick={() => onSelectEvent(e)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── DAY (agenda) ── */
export function DayView({
  current,
  events,
  onSelectEvent,
}: {
  current: Date;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const dayEvents = eventsOnDay(events, current);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-base font-bold">
          {format(current, "EEEE, d MMMM yyyy", { locale: idLocale })}
        </p>
      </div>
      <div className="flex flex-col">
        {dayEvents.length === 0 && (
          <p className="px-4 py-6 text-base text-text/50">
            Tidak ada event di hari ini.
          </p>
        )}
        {dayEvents.map((e) => (
          <button
            key={e.id}
            onClick={() => onSelectEvent(e)}
            className="flex items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/30"
          >
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: tagStyle(e.color).color as string }}
            />
            <div className="flex flex-col">
              <span className="text-base">{e.title}</span>
              <span className="text-sm text-text/50">
                {e.allDay
                  ? "Sepanjang hari"
                  : `${e.startTime ?? "--:--"}${
                      e.endTime ? ` – ${e.endTime}` : ""
                    }`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { parseISO };
