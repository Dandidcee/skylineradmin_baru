const BASE_URL = '/api';

export function getToken() { return localStorage.getItem('token'); }
export function setToken(token: string) { localStorage.setItem('token', token); }
export function removeToken() { localStorage.removeItem('token'); }

// ─────────────────────────────────────────────────────────────
//  TWO-TIER CACHE:
//  Tier 1 — memCache   : in-memory, ultra-cepat, satu sesi
//  Tier 2 — localStorage: persist antar refresh, 30 menit
//  ETag   : kalau server kasih ETag → simpan, kirim If-None-Match
//           kalau server balas 304  → pakai cache, 0 byte dikirim
// ─────────────────────────────────────────────────────────────

const MEM_TTL   = 2  * 60 * 1000;   // 2 menit
const LS_TTL    = 30 * 60 * 1000;   // 30 menit
const LS_PREFIX = 'sfa_';           // skyflow_api cache prefix

type CacheEntry = { data: any; etag?: string; ts: number };
const memCache = new Map<string, CacheEntry>();

/* ── localStorage helpers ── */
function lsRead(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > LS_TTL) { localStorage.removeItem(LS_PREFIX + key); return null; }
    return entry;
  } catch { return null; }
}

function lsWrite(key: string, entry: CacheEntry) {
  try {
    // Strip field besar sebelum disimpan agar localStorage tidak penuh
    const safeData = Array.isArray(entry.data)
      ? entry.data.map(({ fileUrl: _a, clientSignature: _b, ...rest }: any) => rest)
      : entry.data;
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ ...entry, data: safeData }));
  } catch { /* storage full — skip */ }
}

function lsClearAll() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/* ── Main fetch wrapper ── */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token   = getToken();
  const isGet   = !options.method || options.method.toUpperCase() === 'GET';

  if (isGet) {
    // 1. Hot cache (memory) — < 1 ms
    const mem = memCache.get(endpoint);
    if (mem && Date.now() - mem.ts < MEM_TTL) return mem.data;

    // 2. Persistent cache (localStorage)
    const ls = lsRead(endpoint);
    if (ls) {
      // Pompa ke memCache supaya akses berikutnya lebih cepat
      memCache.set(endpoint, ls);

      // 3. ETag conditional request — cek server tapi 0 byte kalau tidak berubah
      try {
        const condHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(ls.etag ? { 'If-None-Match': ls.etag } : {}),
        };
        const condRes = await fetch(`${BASE_URL}${endpoint}`, { headers: condHeaders });

        if (condRes.status === 304) {
          // Tidak berubah — perpanjang TTL dan kembalikan cache
          const refreshed: CacheEntry = { ...ls, ts: Date.now() };
          memCache.set(endpoint, refreshed);
          lsWrite(endpoint, refreshed);
          return ls.data;
        }

        if (condRes.ok) {
          const fresh = await condRes.json();
          const etag  = condRes.headers.get('ETag') ?? undefined;
          const entry: CacheEntry = { data: fresh, etag, ts: Date.now() };
          memCache.set(endpoint, entry);
          lsWrite(endpoint, entry);
          return fresh;
        }
        // Kalau error dari conditional req → fallback ke cache
        return ls.data;
      } catch {
        // Offline / network error → pakai cache
        return ls.data;
      }
    }
  } else {
    // Mutasi (POST/PUT/DELETE) → invalidate cache
    memCache.clear();
    lsClearAll();
  }

  /* ── Normal (uncached) request ── */
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'API Request Failed');
  }

  const data = await response.json();

  if (isGet) {
    const etag  = response.headers.get('ETag') ?? undefined;
    const entry: CacheEntry = { data, etag, ts: Date.now() };
    memCache.set(endpoint, entry);
    lsWrite(endpoint, entry);
  }

  return data;
}
