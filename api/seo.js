import supabase from './db-client.js';
import { requireRole, setCors, CONTENT_ROLES, ADMIN_ROLES, audit, cleanStr } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { slug } = req.query || {};
      if (slug) {
        const { data, error } = await supabase.from('seo_pages').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('seo_pages').select('*').order('slug');
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const b = req.body || {};
      const body = { slug: cleanStr(b.slug, 200), title: cleanStr(b.title, 200), meta_description: cleanStr(b.meta_description, 500), keywords: cleanStr(b.keywords, 500), h1: cleanStr(b.h1, 200), body: cleanStr(b.body, 20000) };
      if (!body.slug || !body.title) return res.status(400).json({ error: 'slug and title required' });
      const { data, error } = await supabase.from('seo_pages').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'seo_page', data.id, { slug: data.slug });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = {};
      for (const k of ['slug', 'title', 'meta_description', 'keywords', 'h1', 'body']) {
        if (rest[k] !== undefined) body[k] = cleanStr(rest[k], k === 'body' ? 20000 : 500);
      }
      const { data, error } = await supabase.from('seo_pages').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'seo_page', id, { fields: Object.keys(body) });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      const { error } = await supabase.from('seo_pages').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'seo_page', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API seo error:', err); res.status(500).json({ error: err.message }); }
}
