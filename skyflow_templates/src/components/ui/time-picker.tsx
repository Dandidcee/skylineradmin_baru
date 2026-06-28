import { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

/**
 * Time picker custom (HH:mm) bertema — pengganti input[type=time] bawaan.
 */
export function TimePicker({
  value,
  onChange,
  placeholder = "--:--",
  className,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [h, m] = value?.split(":") ?? ["", ""];

  const setPart = (hour: string, minute: string) => {
    onChange(`${hour || "00"}:${minute || "00"}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-primary",
          className
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-text/40" />
        <span className={cn(!value && "text-text/30")}>
          {value || placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <div className="flex h-56">
          {/* Jam */}
          <div className="flex flex-col overflow-y-auto border-r">
            <div className="sticky top-0 bg-card px-3 py-1.5 text-sm font-bold text-text/50">
              Jam
            </div>
            {HOURS.map((hh) => (
              <button
                key={hh}
                onClick={() => setPart(hh, m || "00")}
                className={cn(
                  "px-4 py-1.5 text-left text-base transition-colors hover:bg-muted",
                  h === hh && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {hh}
              </button>
            ))}
          </div>
          {/* Menit */}
          <div className="flex flex-col overflow-y-auto">
            <div className="sticky top-0 bg-card px-3 py-1.5 text-sm font-bold text-text/50">
              Menit
            </div>
            {MINUTES.map((mm) => (
              <button
                key={mm}
                onClick={() => setPart(h || "00", mm)}
                className={cn(
                  "px-4 py-1.5 text-left text-base transition-colors hover:bg-muted",
                  m === mm && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {mm}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
