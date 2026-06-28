import { TAG_COLORS, TAG_HEX } from "@/components/clients/tag-colors";
import type { TagColor } from "@/services/types";

/**
 * Warna sticky note untuk kolom hari di planner.
 * Bebas — memakai palet tag Notion-like (lihat tag-colors).
 * Background dibuat tint transparan agar teks tetap terbaca di light & dark.
 */
export type StickyKey = "default" | TagColor;

export const STICKY_OPTIONS: { key: StickyKey; label: string; swatch: string }[] =
  [
    { key: "default", label: "Default", swatch: "var(--card)" },
    ...TAG_COLORS.map((c) => ({ key: c.key, label: c.label, swatch: c.hex })),
  ];

/** Style background + border untuk sticky note (undefined = default/tema). */
export function stickyStyle(key: StickyKey): React.CSSProperties | undefined {
  if (key === "default") return undefined;
  const hex = TAG_HEX[key];
  return {
    backgroundColor: `${hex}1f`, // ~12% alpha
    borderColor: `${hex}55`, // ~33% alpha
  };
}
