import type { CalendarEvent } from "./types";
import { fetchApi } from "./api";

/**
 * CALENDAR SERVICE — sumber data event kalender.
 * Saat ini mock. Ganti isi fungsi dengan fetch/persist ke backend (N8N).
 *
 * Daftar API:
 *  - listEvents(): ambil semua event
 *  - saveEvents(events): simpan semua event (placeholder)
 */

export async function listEvents(): Promise<CalendarEvent[]> {
  try {
    return await fetchApi('/calendar');
  } catch (error) {
    return [];
  }
}

export async function saveEvents(events: CalendarEvent[]): Promise<CalendarEvent[]> {
  return events; // Simplification for now
}
