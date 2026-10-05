import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';

const SELECT = '*, developers(id,name,hq,rating)';

const DEFAULT_PROJECTS = [
  { name: 'Worli Sea Crest', locality: 'Worli', city: 'Mumbai', status: 'Ready to Move', slug: 'worli-sea-crest', cover_image: '/images/tower-a.jpg', description: 'Iconic sea-facing luxury towers in Worli.', price_min: 45000000, price_max: 120000000, featured: true },
  { name: 'Hiranandani Oakwood', locality: 'Powai', city: 'Mumbai', status: 'Ready to Move', slug: 'hiranandani-oakwood', cover_image: '/images/tower-b.jpg', description: 'High-rise luxury living overlooking Powai Lake.', price_min: 32000000, price_max: 75000000, featured: true },
  { name: 'Serenity Lakeside', locality: 'Thane West', city: 'Thane', status: 'Under Construction', slug: 'serenity-lakeside', cover_image: '/images/thane-lake.jpg', description: 'Lakeside township with premium lifestyle amenities.', price_min: 18000000, price_max: 42000000, featured: true },
  { name: 'Sagar Vihar Waterfront', locality: 'Vashi', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'sagar-vihar-waterfront', cover_image: '/images/hero-skyline.jpg', description: 'Waterfront luxury apartments in Sector 8, Vashi.', price_min: 22000000, price_max: 55000000 },
  { name: 'Belapur Crest', locality: 'Belapur', city: 'Navi Mumbai', status: 'Under Construction', slug: 'belapur-crest', cover_image: '/images/tower-a.jpg', description: 'CBD Belapur premium commercial & residential towers.', price_min: 15000000, price_max: 38000000 },
  { name: 'Palm Meadows', locality: 'Kharghar', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'palm-meadows', cover_image: '/images/tower-c.jpg', description: 'Luxury golf-course view residences in Kharghar.', price_min: 12500000, price_max: 32000000 },
  { name: 'Nexzone Aria', locality: 'Panvel', city: 'Navi Mumbai', status: 'Under Construction', slug: 'nexzone-aria', cover_image: '/images/tower-b.jpg', description: 'Modern high-tech township near Panvel airport hub.', price_min: 8500000, price_max: 19000000 },
  { name: 'Urbania Crown', locality: 'Majiwada', city: 'Thane', status: 'Ready to Move', slug: 'urbania-crown', cover_image: '/images/tower-a.jpg', description: 'Integrated luxury township at Majiwada junction.', price_min: 14000000, price_max: 35000000 },
  { name: 'Ghodbunder Gateway', locality: 'Ghodbunder Road', city: 'Thane', status: 'New Launch', slug: 'ghodbunder-gateway', cover_image: '/images/tower-c.jpg', description: 'Scenic green towers along Ghodbunder corridor.', price_min: 11000000, price_max: 28000000 },
  { name: 'Riverside County', locality: 'Panvel', city: 'Navi Mumbai', status: 'Under Construction', slug: 'riverside-county', cover_image: '/images/villa-a.jpg', description: 'Riverfront villas and penthouse residences.', price_min: 16000000, price_max: 45000000 },
  { name: 'Grand Central Seawoods', locality: 'Nerul', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'grand-central-seawoods', cover_image: '/images/tower-a.jpg', description: 'Integrated transit-oriented luxury enclave in Seawoods.', price_min: 24000000, price_max: 60000000 },
  { name: 'Godrej Hills Retreat', locality: 'Kharghar', city: 'Navi Mumbai', status: 'New Launch', slug: 'godrej-hills-retreat', cover_image: '/images/tower-b.jpg', description: 'Hillside forest-theme luxury apartments.', price_min: 13500000, price_max: 31000000 },
];

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
      let q = supabase.from('projects').select('*', { count: 'exact' }).order('id', { ascending: false });
      if (city) q = q.eq('city', city);
      if (locality) q = q.eq('locality', locality);
      if (status) q = q.in('status', String(status).split(','));
      if (developer_id) q = q.eq('developer_id', developer_id);
      if (rera_status) q = q.eq('rera_status', rera_status);
      if (featured === 'true') q = q.eq('featured', true);
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 80); if (s) q = q.or(`name.ilike.%${s}%,locality.ilike.%${s}%,city.ilike.%${s}%`); }
      if (limit) q = q.limit(Math.min(Number(limit), 100));
      let { data, error, count } = await q;
      if (error) throw error;

      if ((!data || data.length === 0) && !search && !city && !locality && !developer_id) {
        const { data: seeded, error: seedErr } = await supabase.from('projects').insert(DEFAULT_PROJECTS).select('*');
        if (seedErr) console.error('Seeding projects error:', seedErr);
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
          count = seeded.length;
        } else {
          data = DEFAULT_PROJECTS.map((p, i) => ({ id: i + 1, ...p }));
          count = data.length;
        }
      }

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
