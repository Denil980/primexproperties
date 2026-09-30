import supabase from './db-client.js';
import { requireRole, setCors, SALES_ROLES, cleanStr } from './_auth.js';
const ALLOWED_EVENTS = ['page_view', 'property_view', 'search', 'filter', 'lead_submit', 'visit_book', 'favorite_add'];
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'POST') {
      const { event_type, property_id, page, meta } = req.body || {};
      if (!event_type || !ALLOWED_EVENTS.includes(String(event_type))) return res.status(400).json({ error: 'Invalid event_type' });
      const pid = property_id && !Number.isNaN(Number(property_id)) ? Number(property_id) : null;
      const cleanMeta = meta && typeof meta === 'object' ? JSON.parse(JSON.stringify(meta).slice(0, 2000)) : null;
      const { data, error } = await supabase.from('analytics_events').insert({ event_type: String(event_type), property_id: pid, page: cleanStr(page, 300), meta: cleanMeta }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'GET') {
      const auth = await requireRole(req, res, SALES_ROLES);
      if (!auth) return;
      const days = Number((req.query || {}).days) || 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase.from('analytics_events').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(1000);
      if (error) throw error;
      const byType = {}; const byPage = {}; const byDay = {};
      (data || []).forEach((e) => {
        byType[e.event_type] = (byType[e.event_type] || 0) + 1;
        if (e.page) byPage[e.page] = (byPage[e.page] || 0) + 1;
        const d = (e.created_at || '').slice(0, 10);
        byDay[d] = (byDay[d] || 0) + 1;
      });
      return res.status(200).json({ total: (data || []).length, byType, byPage, byDay, recent: (data || []).slice(0, 20) });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API analytics error:', err); res.status(500).json({ error: err.message }); }
}
