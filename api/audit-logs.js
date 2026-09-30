import supabase from './db-client.js';
import { requireRole, setCors, ADMIN_ROLES, SALES_ROLES, cleanStr } from './_auth.js';

// Audit log viewer: admins see everything; sales managers see CRM-related entries.
const SALES_ENTITIES = ['lead', 'site_visit'];
const SALES_ACTIONS = ['create', 'update', 'delete'];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const auth = await requireRole(req, res, [...ADMIN_ROLES, 'sales_manager']);
      if (!auth) return;
      const q0 = req.query || {};
      const { action, entity, search, limit, page } = q0;
      let q = supabase.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (auth.role === 'sales_manager') {
        q = q.in('entity', SALES_ENTITIES).in('action', SALES_ACTIONS);
      } else {
        if (action) q = q.eq('action', cleanStr(action, 60));
        if (entity) q = q.eq('entity', cleanStr(entity, 60));
      }
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 60); if (s) q = q.or(`actor_email.ilike.%${s}%,entity_id.ilike.%${s}%`); }
      const lim = Math.min(Number(limit) || 50, 200);
      const pg = Math.max(Number(page) || 1, 1);
      q = q.range((pg - 1) * lim, pg * lim - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length, page: pg, limit: lim });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API audit-logs error:', err); res.status(500).json({ error: err.message }); }
}
