import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar berbasis react-day-picker v9, distyle dengan palet brand kita.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-2",
        month: "flex flex-col gap-3",
        month_caption: "flex h-9 items-center justify-center px-9 relative",
        caption_label: "text-base font-bold",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1",
        button_previous:
          "h-7 w-7 inline-flex items-center justify-center rounded-md text-text/60 hover:bg-muted hover:text-text transition-colors",
        button_next:
          "h-7 w-7 inline-flex items-center justify-center rounded-md text-text/60 hover:bg-muted hover:text-text transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-text/40 w-9 text-sm font-normal",
        week: "flex w-full mt-1",
        day: "h-9 w-9 p-0 text-center text-base",
        day_button:
          "h-9 w-9 inline-flex items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary transition-colors",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
        today: "[&>button]:border [&>button]:border-primary",
        outside: "text-text/30",
        disabled: "text-text/20 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
