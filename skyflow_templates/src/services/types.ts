/**
 * TYPES — definisi tipe data bersama untuk seluruh aplikasi.
 */

export type DocumentStatus = "draft" | "processing" | "ready" | "failed";

export type DocumentItem = {
  id: string;
  title: string;
  template: string;
  status: DocumentStatus;
  createdAt: string; // ISO string
  sizeKb: number;
  clientId?: string;
  client?: ClientItem;
  fileUrl?: string;
  amount?: string;
  clientSignature?: string;
};

export type DashboardStats = {
  totalDocuments: number;
  generatedThisMonth: number;
  templates: number;
  storageUsedMb: number;
};

/**
 * Status perjalanan client dari awal hingga selesai.
 */
export type ClientStatus =
  | "pending"
  | "cancel"
  | "waiting_payment"
  | "dp_done"
  | "payment_full_done"
  | "canceled_by_skyflow"
  | "done";

export type ClientItem = {
  id: string;
  name: string; // Nama Client
  phone: string; // No HP Client
  status: ClientStatus;
  request: string; // Permintaan
  progress: string; // Progres
  notes: string; // Catatan
  company?: string; // Perusahaan
  address?: string; // Alamat
};

/* ──────────────────────────────────────────────
 * TABEL DATABASE CUSTOM (ala AFFiNE)
 * Model fleksibel: kolom bertipe + baris record.
 * ────────────────────────────────────────────── */

export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "checkbox"
  | "select"
  | "multi_select"
  | "url"
  | "email"
  | "phone";

/** Key warna tag (lihat TAG_COLORS di komponen tabel). */
export type TagColor =
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export type SelectOption = {
  id: string;
  label: string;
  color: TagColor;
};

export type TableColumn = {
  id: string;
  name: string;
  type: ColumnType;
  width?: number; // lebar kolom (px); kosong = fleksibel
  options?: SelectOption[]; // hanya untuk type "select"
};

export type TableRow = {
  id: string;
  /** nilai sel: text = string bebas; select = id opsi */
  cells: Record<string, string>;
};

export type TableData = {
  columns: TableColumn[];
  rows: TableRow[];
};

/* ──────────────────────────────────────────────
 * KALENDER
 * ────────────────────────────────────────────── */

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // tanggal mulai (yyyy-MM-dd)
  endDate?: string; // tanggal selesai (untuk multi-hari)
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  color: TagColor;
  notes?: string;
};

/* ──────────────────────────────────────────────
 * TODO / AKTIVITAS (papan mingguan)
 * ────────────────────────────────────────────── */

export type TodoItem = {
  id: string;
  day: string; // tanggal (yyyy-MM-dd)
  text: string;
  done: boolean;
};
