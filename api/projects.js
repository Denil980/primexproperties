import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';
const SELECT = '*, developers(id,name,hq,rating)';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { id, slug, city, locality, status, featured, search, limit, developer_id, rera_status } = q0;
      if (id || slug) {
        let q = supabase.from('projects').select(SELECT);
        if (id) q = q.eq('id', id); else q = q.eq('slug', slug);
        const { data, error } = await q.single();
        if (error) throw error;
        const { data: units } = await supabase.from('properties').select('id,title,slug,price,bedrooms,bathrooms,area_sqft,cover_image,status').eq('project_id', data.id).eq('is_active', true).limit(20);
        return res.status(200).json({ ...data, units: units || [] });
      }
      let q = supabase.from('projects').select(SELECT, { count: 'exact' }).order('featured', { ascending: false }).order('id', { ascending: false });
      if (city) q = q.eq('city', city);
      if (locality) q = q.eq('locality', locality);
      if (status) q = q.in('status', String(status).split(','));
      if (developer_id) q = q.eq('developer_id', developer_id);
      if (rera_status) q = q.eq('rera_status', rera_status);
      if (featured === 'true') q = q.eq('featured', true);
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 80); if (s) q = q.or(`name.ilike.%${s}%,locality.ilike.%${s}%,city.ilike.%${s}%`); }
      if (limit) q = q.limit(Math.min(Number(limit), 100));
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length });
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const body = { ...(req.body || {}) };
      delete body.id; delete body.developers; delete body.units; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      if (!body.name) return res.status(400).json({ error: 'Name is required' });
      if (!body.slug) body.slug = `${slugify(body.name)}-${Date.now().toString(36)}`;
      const { data, error } = await supabase.from('projects').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'project', data.id, { name: data.name });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = { ...rest };
      delete body.developers; delete body.units; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      const { data, error } = await supabase.from('projects').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'project', id, { fields: Object.keys(body) });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabase.from('properties').update({ project_id: null }).eq('project_id', id);
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'project', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API projects error:', err); res.status(500).json({ error: err.message }); }
}
