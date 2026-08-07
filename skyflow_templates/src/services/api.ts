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

// Global API Cache
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  
  // Return cached data for GET requests if valid
  if (isGet) {
    const cached = apiCache.get(endpoint);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
  } else {
    // Invalidate entire cache on POST, PUT, DELETE to ensure fresh data
    apiCache.clear();
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
  
  // Cache successful GET responses
  if (isGet) {
    apiCache.set(endpoint, { data, timestamp: Date.now() });
  }

  return data;
}
