import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { id, slug, featured, search, limit } = q0;
      if (id || slug) {
        let q = supabase.from('developers').select('*');
        if (id) q = q.eq('id', id); else q = q.eq('slug', slug);
        const { data, error } = await q.single();
        if (error) throw error;
        const { data: projects } = await supabase.from('projects').select('id,name,slug,city,locality,cover_image,status,price_min,price_max').eq('developer_id', data.id).limit(20);
        const { data: props } = await supabase.from('properties').select('id,title,slug,price,cover_image,bedrooms,locality').eq('developer_id', data.id).eq('is_active', true).limit(12);
        return res.status(200).json({ ...data, projects: projects || [], properties: props || [] });
      }
      let q = supabase.from('developers').select('*', { count: 'exact' }).order('featured', { ascending: false }).order('name');
      if (featured === 'true') q = q.eq('featured', true);
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 60); if (s) q = q.ilike('name', `%${s}%`); }
      if (limit) q = q.limit(Math.min(Number(limit), 100));
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length });
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const body = { ...(req.body || {}) };
      delete body.id; delete body.projects; delete body.properties; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      if (!body.name) return res.status(400).json({ error: 'Name is required' });
      if (!body.slug) body.slug = slugify(body.name);
      const { data, error } = await supabase.from('developers').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'developer', data.id, { name: data.name });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = { ...rest };
      delete body.projects; delete body.properties; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      const { data, error } = await supabase.from('developers').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'developer', id, { fields: Object.keys(body) });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('developers').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'developer', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API developers error:', err); res.status(500).json({ error: err.message }); }
}
