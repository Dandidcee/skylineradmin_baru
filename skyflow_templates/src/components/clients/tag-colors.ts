import type { TagColor } from "@/services/types";

/**
 * Palet warna tag ala Notion untuk opsi kolom "select".
 * Sengaja di luar palet brand utama — khusus untuk tag database
 * agar tiap opsi bisa dibedakan warnanya (bisa dipilih user).
 *
 * Badge memakai background semi-transparan + teks & border warna penuh,
 * sehingga tetap terbaca di light maupun dark mode.
 */
export const TAG_COLORS: { key: TagColor; label: string; hex: string }[] = [
  { key: "gray", label: "Abu", hex: "#8a8a8a" },
  { key: "brown", label: "Cokelat", hex: "#a1632b" },
  { key: "orange", label: "Oranye", hex: "#d9730d" },
  { key: "yellow", label: "Kuning", hex: "#caa023" },
  { key: "green", label: "Hijau", hex: "#2f9e44" },
  { key: "blue", label: "Biru", hex: "#2f80ed" },
  { key: "purple", label: "Ungu", hex: "#9065d9" },
  { key: "pink", label: "Pink", hex: "#c2389a" },
  { key: "red", label: "Merah", hex: "#e03e3e" },
];

export const TAG_HEX: Record<TagColor, string> = TAG_COLORS.reduce(
  (acc, c) => {
    acc[c.key] = c.hex;
    return acc;
  },
  {} as Record<TagColor, string>
);

/** Style badge (bg transparan + teks & border warna penuh). */
export function tagStyle(color: TagColor): React.CSSProperties {
  const hex = TAG_HEX[color] ?? TAG_HEX.gray;
  return {
    backgroundColor: `${hex}26`, // ~15% alpha
    color: hex,
    border: `1px solid ${hex}59`, // ~35% alpha
  };
}
