import { useEffect, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { TAG_COLORS } from "@/components/clients/tag-colors";
import { useCalendar } from "@/store/calendar-store";
import type { CalendarEvent, TagColor } from "@/services/types";

const uid = () => `evt-${Math.random().toString(36).slice(2, 8)}`;

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** event yang diedit; jika null = buat baru */
  event: CalendarEvent | null;
  /** tanggal default saat buat baru (yyyy-MM-dd) */
  defaultDate?: string;
};

const blank = (date: string): CalendarEvent => ({
  id: uid(),
  title: "",
  date,
  allDay: true,
  color: "blue",
});

export function EventDialog({ open, onOpenChange, event, defaultDate }: Props) {
  const { upsertEvent, deleteEvent } = useCalendar();
  const [draft, setDraft] = useState<CalendarEvent>(
    blank(defaultDate ?? new Date().toISOString().slice(0, 10))
  );

  useEffect(() => {
    if (open) {
      setDraft(
        event ?? blank(defaultDate ?? new Date().toISOString().slice(0, 10))
      );
    }
  }, [open, event, defaultDate]);

  const set = (patch: Partial<CalendarEvent>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    if (!draft.title.trim()) return;
    upsertEvent({ ...draft, title: draft.title.trim() });
    onOpenChange(false);
  };

  const remove = () => {
    deleteEvent(draft.id);
    onOpenChange(false);
  };

  const selectedDate =
    draft.date && isValid(parseISO(draft.date)) ? parseISO(draft.date) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90dvh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogHeader className="border-b p-4 sm:p-6 pb-4 shrink-0">
          <DialogTitle>{event ? "Edit Event" : "Event Baru"}</DialogTitle>
          <p className="text-sm text-text/60 mt-1">
            {event ? "Ubah detail event di kalender." : "Tambahkan event baru ke kalender."}
          </p>
        </DialogHeader>

        <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
          {/* Judul */}
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Judul event"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />

          {/* Tanggal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text/80">Tanggal</label>
            <Popover>
              <PopoverTrigger className="flex w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors">
                <CalendarIcon className="h-4 w-4 text-text/40" />
                {selectedDate
                  ? format(selectedDate, "EEEE, d MMM yyyy", { locale: idLocale })
                  : "Pilih tanggal"}
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  locale={idLocale}
                  onSelect={(d) =>
                    d && set({ date: format(d, "yyyy-MM-dd") })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* All-day toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-text/80">
            <input
              type="checkbox"
              checked={draft.allDay}
              onChange={(e) => set({ allDay: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            Sepanjang hari
          </label>

          {/* Jam (jika bukan all-day) */}
          {!draft.allDay && (
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/80">Mulai</label>
                <TimePicker
                  value={draft.startTime}
                  onChange={(v) => set({ startTime: v })}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/80">Selesai</label>
                <TimePicker
                  value={draft.endTime}
                  onChange={(v) => set({ endTime: v })}
                />
              </div>
            </div>
          )}

          {/* Warna */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text/80">Warna</label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.key}
                  title={c.label}
                  onClick={() => set({ color: c.key as TagColor })}
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                    draft.color === c.key
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-card"
                      : "border-border"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text/80">Catatan Tambahan</label>
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Catatan (opsional)"
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="border-t p-4 sm:px-6 bg-muted/10 flex justify-end gap-2 shrink-0">
          {event && (
            <Button
              variant="outline"
              onClick={remove}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
