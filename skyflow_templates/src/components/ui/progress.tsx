import { cn } from "@/lib/utils";

/**
 * Progress bar (gaya shadcn) — custom, tanpa dependency tambahan.
 * value: 0–100.
 */
export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-all duration-500 ease-out",
          barClassName
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
