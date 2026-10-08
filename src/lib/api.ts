import supabase from './supabase';

export async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(path, { headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export async function apiMut<T = any>(path: string, method: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export function formatINR(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr >= 100 ? Math.round(cr) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (num >= 100000) {
    const l = num / 100000;
    return `₹${l >= 100 ? Math.round(l) : l.toFixed(2).replace(/\.?0+$/, '')} L`;
  }
  return '₹' + num.toLocaleString('en-IN');
}

export function formatINRFull(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return '₹' + num.toLocaleString('en-IN');
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export const CITY_AREAS: Record<string, string[]> = {
  Mumbai: ['Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Worli', 'Lower Parel', 'Thane West', 'Malad West', 'Borivali West', 'Chembur'],
  'Navi Mumbai': ['Vashi', 'Belapur', 'Kharghar', 'Nerul', 'Sanpada', 'Airoli', 'Seawoods', 'Panvel'],
  Thane: ['Thane West', 'Ghodbunder Road', 'Majiwada', 'Kolshet', 'Manpada', 'Vartak Nagar'],
};

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Plot', 'Commercial'];
export const STATUSES = ['Under Construction', 'Ready to Move', 'New Launch', 'Resale'];
export const LISTING_TYPES = ['Sale', 'Rent'];

export function trackEvent(event_type: string, payload: Record<string, unknown> = {}) {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, page: window.location.pathname, ...payload }),
    }).catch(() => {});
  } catch { /* noop */ }
}
