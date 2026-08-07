const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

// ── Persistent API Cache (localStorage) ──────────────────────────────────
// In-memory cache: gunakan sebagai "hot cache" dalam satu sesi
const memCache = new Map<string, { data: any; timestamp: number }>();
const MEM_TTL  = 60 * 1000;          // 1 menit — hot cache
const LS_TTL   = 10 * 60 * 1000;     // 10 menit — persistent cache
const LS_PREFIX = 'skyflow_api_';

function lsGet(endpoint: string): any | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + endpoint);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > LS_TTL) {
      localStorage.removeItem(LS_PREFIX + endpoint);
      return null;
    }
    return data;
  } catch { return null; }
}

function lsSet(endpoint: string, data: any) {
  try {
    // Jangan cache fileUrl — terlalu besar
    const safeData = Array.isArray(data)
      ? data.map(({ fileUrl: _f, clientSignature: _c, ...rest }: any) => rest)
      : data;
    localStorage.setItem(LS_PREFIX + endpoint, JSON.stringify({ data: safeData, ts: Date.now() }));
  } catch { /* localStorage penuh — skip */ }
}

function lsClear() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  if (isGet) {
    // 1. Coba hot cache (in-memory) dulu — paling cepat
    const mem = memCache.get(endpoint);
    if (mem && Date.now() - mem.timestamp < MEM_TTL) {
      return mem.data;
    }
    // 2. Coba persistent cache (localStorage) — cepat, lintas refresh
    const ls = lsGet(endpoint);
    if (ls !== null) {
      // Simpan juga ke memCache supaya request berikutnya lebih cepat lagi
      memCache.set(endpoint, { data: ls, timestamp: Date.now() });
      return ls;
    }
  } else {
    // Mutasi → invalidate semua cache
    memCache.clear();
    lsClear();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'API Request Failed');
  }

  const data = await response.json();

  if (isGet) {
    memCache.set(endpoint, { data, timestamp: Date.now() });
    lsSet(endpoint, data);
  }

  return data;
}
