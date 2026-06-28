import { useEffect, useState } from "react";
import { ImageIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Cover banner ala Notion yang bisa diganti background-nya.
 * Pilihan tersimpan di localStorage per `storageKey`.
 */

type Cover = { id: string; label: string; css: string };

const COVERS: Cover[] = [
  { id: "none", label: "Polos", css: "var(--muted)" },
  { id: "primary", label: "Primary", css: "var(--primary)" },
  { id: "secondary", label: "Secondary", css: "var(--secondary)" },
  { id: "accent", label: "Accent", css: "var(--accent)" },
  { id: "dark", label: "Gelap", css: "var(--text)" },
  {
    id: "dots",
    label: "Dots",
    css: "radial-gradient(circle, var(--primary) 1px, var(--card) 1px)",
  },
];

export function CoverBanner({
  storageKey,
  className,
}: {
  storageKey: string;
  className?: string;
}) {
  const [coverId, setCoverId] = useState<string>("amber");

  useEffect(() => {
    const saved = localStorage.getItem(`cover:${storageKey}`);
    if (saved) setCoverId(saved);
  }, [storageKey]);

  const select = (id: string) => {
    setCoverId(id);
    localStorage.setItem(`cover:${storageKey}`, id);
  };

  const cover = COVERS.find((c) => c.id === coverId) ?? COVERS[1];

  return (
    <div
      className={cn(
        "group relative h-28 w-full overflow-hidden rounded-lg sm:h-36",
        className
      )}
      style={{
        background: cover.css,
        backgroundSize: cover.id === "dots" ? "16px 16px" : undefined,
      }}
    >
      <Popover>
        <PopoverTrigger
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-card/80 px-2.5 py-1.5 text-sm text-text opacity-0 backdrop-blur outline-none transition-opacity hover:bg-card focus:opacity-100 group-hover:opacity-100"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Ubah cover
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <p className="px-1 pb-2 text-sm font-bold text-text/60">
            Pilih Background
          </p>
          <div className="grid grid-cols-4 gap-2">
            {COVERS.map((c) => (
              <button
                key={c.id}
                title={c.label}
                onClick={() => select(c.id)}
                style={{
                  background: c.css,
                  backgroundSize: c.id === "dots" ? "10px 10px" : undefined,
                }}
                className={cn(
                  "relative h-12 rounded-md border transition-transform hover:scale-105",
                  coverId === c.id
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-card"
                    : "border-border"
                )}
              >
                {coverId === c.id && (
                  <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-primary-foreground drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
