import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoverBanner } from "@/components/ui/cover-banner";
import { RingProgress } from "@/components/ui/ring-progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { STICKY_OPTIONS, stickyStyle, type StickyKey } from "@/components/ui/sticky-colors";
import { useTodos } from "@/store/todo-store";
import type { TodoItem } from "@/services/types";

function TodoRow({ todo }: { todo: TodoItem }) {
  const { toggleTodo, editTodo, removeTodo } = useTodos();
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/todo-id", todo.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group flex items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/40"
    >
      <button
        onClick={() => toggleTodo(todo.id)}
        aria-label="Tandai selesai"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          todo.done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary"
        )}
      >
        {todo.done && <Check className="h-3 w-3" />}
      </button>
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.textContent?.trim() ?? "";
          if (text && text !== todo.text) editTodo(todo.id, text);
        }}
        className={cn(
          "flex-1 cursor-text text-base outline-none focus:bg-muted/60",
          todo.done && "text-text/40 line-through"
        )}
      >
        {todo.text}
      </span>
      <button
        onClick={() => removeTodo(todo.id)}
        aria-label="Hapus"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text/30 opacity-0 transition-opacity hover:bg-muted hover:text-text/70 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DayColumn({
  day,
  weekdayIndex,
  todos,
}: {
  day: Date;
  weekdayIndex: number;
  todos: TodoItem[];
}) {
  const { addTodo, moveTodo } = useTodos();
  const [draft, setDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [colorKey, setColorKey] = useState<StickyKey>("default");

  // warna sticky disimpan per hari-dalam-minggu (persisten lintas minggu)
  useEffect(() => {
    const saved = localStorage.getItem(`sticky:${weekdayIndex}`) as StickyKey | null;
    if (saved) setColorKey(saved);
  }, [weekdayIndex]);

  const pickColor = (key: StickyKey) => {
    setColorKey(key);
    localStorage.setItem(`sticky:${weekdayIndex}`, key);
  };

  const today = isSameDay(day, new Date());
  const dayIso = format(day, "yyyy-MM-dd");
  const dayTodos = todos.filter((t) => t.day === dayIso);
  const doneCount = dayTodos.filter((t) => t.done).length;
  const stickyCss = stickyStyle(colorKey);

  const submit = () => {
    if (draft.trim()) {
      addTodo(dayIso, draft.trim());
      setDraft("");
    }
  };

  return (
    <Card
      className={cn(
        "group/col flex flex-col shadow-sm transition-shadow hover:shadow-md",
        dragOver && "ring-2 ring-primary"
      )}
      style={stickyCss}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData("text/todo-id");
        if (id) moveTodo(id, dayIso);
      }}
    >
      <CardContent className="flex flex-col gap-2 p-3">
        <div
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1.5",
            today ? "bg-primary/15" : "bg-muted/60"
          )}
        >
          <div className="flex flex-col">
            <span className="text-base font-bold capitalize leading-tight">
              {format(day, "EEEE", { locale: idLocale })}
            </span>
            <span className="text-sm text-text/50">
              {format(day, "d MMM", { locale: idLocale })}
            </span>
          </div>
          <Popover>
            <PopoverTrigger
              className="flex h-6 w-6 items-center justify-center rounded text-text/40 opacity-0 outline-none transition-opacity hover:bg-black/5 hover:text-text/70 group-hover/col:opacity-100"
              aria-label="Ubah warna sticky note"
            >
              <Palette className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52">
              <p className="px-1 pb-2 text-sm font-bold text-text/60">
                Warna Catatan
              </p>
              <div className="grid grid-cols-5 gap-2">
                {STICKY_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    title={c.label}
                    onClick={() => pickColor(c.key)}
                    style={{ background: c.swatch }}
                    className={cn(
                      "h-8 rounded-md border border-border transition-transform hover:scale-105",
                      colorKey === c.key &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-card"
                    )}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {dayTodos.length > 0 && (
          <span className="px-1 text-sm text-text/40">
            {doneCount}/{dayTodos.length} selesai
          </span>
        )}

        <div className="flex min-h-[2rem] flex-col gap-0.5">
          {dayTodos.map((t) => (
            <TodoRow key={t.id} todo={t} />
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-1">
          <Plus className="h-3.5 w-3.5 shrink-0 text-text/30" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onBlur={submit}
            placeholder="Tambah aktivitas…"
            className="h-7 w-full bg-transparent text-base outline-none placeholder:text-text/30"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function TodoPage() {
  const { todos, loading } = useTodos();
  const [anchor, setAnchor] = useState(new Date());

  const weekStart = useMemo(
    () => startOfWeek(anchor, { weekStartsOn: 1 }),
    [anchor]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const stats = useMemo(() => {
    const pct = (d: number, t: number) => (t ? Math.round((d / t) * 100) : 0);
    const todayIso = format(new Date(), "yyyy-MM-dd");

    const perDay = days.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const list = todos.filter((t) => t.day === ds);
      const doneCount = list.filter((t) => t.done).length;
      return {
        label: format(d, "EEEEEE", { locale: idLocale }),
        total: list.length,
        done: doneCount,
        ratio: list.length ? doneCount / list.length : 0,
        isToday: ds === todayIso,
      };
    });

    const weekList = todos.filter((t) =>
      days.some((d) => format(d, "yyyy-MM-dd") === t.day)
    );
    const weekDone = weekList.filter((t) => t.done).length;
    const todayList = todos.filter((t) => t.day === todayIso);
    const todayDone = todayList.filter((t) => t.done).length;

    return {
      perDay,
      week: { done: weekDone, total: weekList.length, pct: pct(weekDone, weekList.length) },
      today: { done: todayDone, total: todayList.length, pct: pct(todayDone, todayList.length) },
    };
  }, [todos, days]);

  return (
    <AppLayout title="Aktivitas">
      <div className="flex flex-col gap-4">
        <CoverBanner storageKey="activities" />

        {/* Statistik visual */}
        <Card className="overflow-hidden">
          <CardContent className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[auto_auto_1fr] lg:items-center">
            {/* Ring minggu ini */}
            <div className="flex items-center justify-center gap-4">
              <RingProgress
                value={stats.week.pct}
                label={`${stats.week.pct}%`}
                size={132}
              />
              <div className="flex flex-col">
                <span className="text-sm text-text/60">Minggu Ini</span>
                <span className="font-heading text-2xl font-bold">
                  {stats.week.done}
                  <span className="text-base font-normal text-text/40">
                    /{stats.week.total}
                  </span>
                </span>
                <span className="text-sm text-text/50">aktivitas selesai</span>
              </div>
            </div>

            {/* Ring hari ini */}
            <div className="flex items-center justify-center gap-4 lg:border-l lg:pl-6">
              <RingProgress
                value={stats.today.pct}
                label={`${stats.today.pct}%`}
                size={108}
                stroke={11}
              />
              <div className="flex flex-col">
                <span className="text-sm text-text/60">Hari Ini</span>
                <span className="font-heading text-2xl font-bold">
                  {stats.today.done}
                  <span className="text-base font-normal text-text/40">
                    /{stats.today.total}
                  </span>
                </span>
                <span className="text-sm text-text/50">aktivitas selesai</span>
              </div>
            </div>

            {/* Bar chart per hari */}
            <div className="flex flex-col gap-2 lg:border-l lg:pl-6">
              <span className="text-sm text-text/60">Penyelesaian per Hari</span>
              <div className="flex items-end justify-between gap-2 pt-1">
                {stats.perDay.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-sm text-text/40">
                      {d.total ? `${d.done}/${d.total}` : ""}
                    </span>
                    <div className="flex h-20 w-full items-end overflow-hidden rounded-md bg-muted/60">
                      <div
                        className={cn(
                          "w-full rounded-md transition-all duration-500",
                          d.isToday ? "bg-accent" : "bg-primary/80"
                        )}
                        style={{
                          height: `${Math.max(d.ratio * 100, d.total ? 10 : 0)}%`,
                        }}
                        title={`${d.done}/${d.total}`}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm capitalize",
                        d.isToday ? "font-bold text-primary" : "text-text/50"
                      )}
                    >
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAnchor((d) => addWeeks(d, -1))}
              aria-label="Minggu sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAnchor((d) => addWeeks(d, 1))}
              aria-label="Minggu berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              Minggu ini
            </Button>
            <h2 className="ml-1 font-heading text-xl font-bold">
              {format(weekStart, "d MMM", { locale: idLocale })} –{" "}
              {format(addDays(weekStart, 6), "d MMM yyyy", { locale: idLocale })}
            </h2>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-base text-text/60">Memuat aktivitas...</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {days.map((day, i) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                weekdayIndex={i}
                todos={todos}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
