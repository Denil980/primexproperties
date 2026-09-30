import supabase from './db-client.js';
import { requireRole, slugify, setCors, CONTENT_ROLES, ADMIN_ROLES, audit, cleanStr } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { slug, id, category, published, limit, search } = req.query || {};
      if (slug || id) {
        let q = supabase.from('blog_posts').select('*');
        if (slug) q = q.eq('slug', slug); else q = q.eq('id', id);
        const { data, error } = await q.single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let q = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (published === 'true') q = q.eq('published', true);
      if (category) q = q.eq('category', category);
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 60); if (s) q = q.or(`title.ilike.%${s}%,excerpt.ilike.%${s}%`); }
      if (limit) q = q.limit(Math.min(Number(limit), 50));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const b = req.body || {};
      const body = { title: cleanStr(b.title, 200), slug: cleanStr(b.slug, 220), excerpt: cleanStr(b.excerpt, 500), content: cleanStr(b.content, 50000), category: cleanStr(b.category, 80), cover_image: cleanStr(b.cover_image, 500), author: cleanStr(b.author, 120), tags: cleanStr(b.tags, 300), published: !!b.published };
      if (!body.title) return res.status(400).json({ error: 'Title required' });
      if (!body.slug) body.slug = `${slugify(body.title)}-${Date.now().toString(36)}`;
      const { data, error } = await supabase.from('blog_posts').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'blog_post', data.id, { title: data.title });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = {};
      for (const k of ['title', 'slug', 'excerpt', 'content', 'category', 'cover_image', 'author', 'tags']) {
        if (rest[k] !== undefined) body[k] = cleanStr(rest[k], k === 'content' ? 50000 : 500);
      }
      if (rest.published !== undefined) body.published = !!rest.published;
      const { data, error } = await supabase.from('blog_posts').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'blog_post', id, { fields: Object.keys(body) });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'blog_post', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API blog error:', err); res.status(500).json({ error: err.message }); }
}
