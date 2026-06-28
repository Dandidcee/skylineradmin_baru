# State & API Registry — SkyFlowDOC

> Baca file ini SEBELUM membuat state atau API baru. Jangan buat duplikat.

## State (single source of truth)

| Hook            | Provider          | Lokasi                          | Isi                                          |
|-----------------|-------------------|---------------------------------|----------------------------------------------|
| `useTheme()`    | `ThemeProvider`   | `src/store/theme-store.tsx`     | `theme`, `toggleTheme()`, `setTheme()`       |
| `useDocuments()`| `DocumentProvider`| `src/store/document-store.tsx`  | `documents`, `loading`, `error`, `refresh()` |
| `useClients()`  | `ClientProvider`  | `src/store/client-store.tsx`    | tabel client: `data`, `addRow`, `edit...`, `setColumnWidth`, `moveRow`, dll |
| `useCalendar()` | `CalendarProvider`| `src/store/calendar-store.tsx`  | `events`, `loading`, `error`, `refresh()`, `upsertEvent()`, `deleteEvent()` |
| `useTodos()`    | `TodoProvider`    | `src/store/todo-store.tsx`      | `todos`, `loading`, `error`, `refresh()`, `addTodo()`, `toggleTodo()`, `editTodo()`, `removeTodo()` |

## API / Services

Lokasi: `src/services/document-service.ts`

| Fungsi                    | Return                | Keterangan                          |
|---------------------------|-----------------------|-------------------------------------|
| `listDocuments()`         | `DocumentItem[]`      | Ambil semua dokumen                 |
| `getDashboardStats()`     | `DashboardStats`      | Ringkasan statistik dashboard       |
| `generateDocument(input)` | `DocumentItem`        | Buat dokumen PDF baru (placeholder) |

Lokasi: `src/services/client-service.ts`

| Fungsi                 | Return            | Keterangan                              |
|------------------------|-------------------|-----------------------------------------|
| `getClientTable()`     | `TableData`       | Ambil kolom + baris tabel client        |
| `saveClientTable(data)`| `TableData`       | Simpan tabel client (mock, TODO N8N)    |

Lokasi: `src/services/calendar-service.ts`

| Fungsi              | Return             | Keterangan                          |
|---------------------|--------------------|-------------------------------------|
| `listEvents()`      | `CalendarEvent[]`  | Ambil semua event kalender          |
| `saveEvents(events)`| `CalendarEvent[]`  | Simpan event (mock, TODO N8N)       |

Lokasi: `src/services/todo-service.ts`

| Fungsi            | Return        | Keterangan                          |
|-------------------|---------------|-------------------------------------|
| `listTodos()`     | `TodoItem[]`  | Ambil semua todo/aktivitas          |
| `saveTodos(todos)`| `TodoItem[]`  | Simpan todo (mock, TODO N8N)        |

## Types

Lokasi: `src/services/types.ts`
- `DocumentStatus` — `"draft" | "processing" | "ready" | "failed"`
- `DocumentItem`
- `DashboardStats`
- `ClientStatus` — `"pending" | "cancel" | "waiting_payment" | "dp_done" | "payment_full_done" | "canceled_by_skyflow" | "done"`
- `ClientItem`

## Aturan
1. Data dokumen HANYA dari `useDocuments()`. Jangan fetch di komponen.
2. Data client HANYA dari `useClients()`. Jangan fetch/simpan client di komponen.
3. Tema HANYA dari `useTheme()`.
4. Semua call ke backend lewat `src/services/`. Jangan fetch langsung di komponen/store lain.
