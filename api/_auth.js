import supabase from './db-client.js';

// Canonical RBAC roles (least → most privilege for staff scoping)
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  SALES_AGENT: 'sales_agent',
  CONTENT_MANAGER: 'content_manager',
  CUSTOMER: 'customer',
};

export const ALL_ROLES = ['super_admin', 'admin', 'sales_manager', 'sales_agent', 'content_manager', 'customer'];
export const STAFF_ROLES = ['super_admin', 'admin', 'sales_manager', 'sales_agent', 'content_manager'];
export const ADMIN_ROLES = ['super_admin', 'admin'];
export const SALES_ROLES = ['super_admin', 'admin', 'sales_manager', 'sales_agent'];
export const CONTENT_ROLES = ['super_admin', 'admin', 'content_manager'];

// Backwards-compatible: legacy 'agent' role maps to sales_agent
export function normalizeRole(role) {
  if (!role) return 'customer';
  if (role === 'agent') return 'sales_agent';
  return ALL_ROLES.includes(role) ? role : 'customer';
}

export function isStaffRole(role) {
  return STAFF_ROLES.includes(normalizeRole(role));
}

export async function getAuthUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function getProfileForUser(user) {
  if (!user) return null;
  const { data: byId } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (byId) return byId;
  if (user.email) {
    const { data: byEmail } = await supabase.from('profiles').select('*').eq('email', user.email).maybeSingle();
    return byEmail;
  }
  return null;
}

export async function requireRole(req, res, roles = ADMIN_ROLES) {
  const user = await getAuthUser(req);
  if (!user) { res.status(401).json({ error: 'Unauthorized. Please sign in.' }); return null; }
  const profile = await getProfileForUser(user);
  const role = normalizeRole(profile?.role);
  if (!roles.includes(role)) { res.status(403).json({ error: 'Forbidden. Insufficient permissions.' }); return null; }
  return { user, profile, role };
}

export function slugify(text) {
  return String(text || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

export function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

// ---- Input validation helpers (server-side, anti-spam) ----
export function cleanStr(v, max = 500) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  if (!s) return null;
  return s.slice(0, max);
}

export function isValidEmail(v) {
  if (!v) return false;
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(String(v).trim());
}

// Indian + international phone shapes: digits, spaces, dashes, optional leading +
export function isValidPhone(v) {
  if (!v) return false;
  const s = String(v).trim();
  if (!/^[+\d][\d\s-]{7,17}$/.test(s)) return false;
  return s.replace(/\D/g, '').length >= 8;
}

export function looksSpammy(...fields) {
  const joined = fields.filter(Boolean).join(' ').toLowerCase();
  if (!joined) return false;
  if (/(https?:\/\/|www\.)/.test(joined) && joined.length > 40) return true;
  if (/<\s*(script|iframe|object|embed)/i.test(joined)) return true;
  const urls = (joined.match(/https?:\/\//g) || []).length;
  return urls >= 2;
}

// ---- Audit logging (fire-and-forget; never blocks the request) ----
export function audit(req, auth, action, entity, entityId = null, meta = null) {
  try {
    const row = {
      actor_user_id: auth?.user?.id || null,
      actor_email: auth?.user?.email || auth?.profile?.email || null,
      actor_role: auth?.role || null,
      action: String(action || '').slice(0, 60),
      entity: String(entity || '').slice(0, 60),
      entity_id: entityId === null || entityId === undefined ? null : String(entityId).slice(0, 60),
      meta: meta || null,
      ip: clientIp(req),
    };
    supabase.from('audit_logs').insert(row).then(
      () => {},
      (e) => console.error('audit insert failed:', e?.message || e)
    );
  } catch (e) {
    console.error('audit failed:', e?.message || e);
  }
}
