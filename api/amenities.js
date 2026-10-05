import supabase from './db-client.js';
import { requireRole, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit, cleanStr } from './_auth.js';

const DEFAULT_AMENITIES = [
  { name: '24x7 Security', category: 'Security' },
  { name: 'Clubhouse', category: 'Lifestyle' },
  { name: 'Covered Parking', category: 'Convenience' },
  { name: 'EV Charging', category: 'Eco' },
  { name: 'High-speed Lifts', category: 'Convenience' },
  { name: 'Power Backup', category: 'Convenience' },
  { name: 'Amphitheatre', category: 'Lifestyle' },
  { name: 'Creche', category: 'Family' },
  { name: 'Kids Play Area', category: 'Family' },
  { name: 'Senior Citizen Deck', category: 'Family' },
  { name: 'Landscaped Gardens', category: 'Outdoors' },
  { name: 'Pet Park', category: 'Outdoors' },
  { name: 'Infinity Pool', category: 'Sports' },
  { name: 'Rooftop Lounge', category: 'Lifestyle' },
  { name: 'Badminton Court', category: 'Sports' },
  { name: 'Cricket Pitch', category: 'Sports' },
  { name: 'Jogging Track', category: 'Sports' },
  { name: 'Tennis Court', category: 'Sports' },
  { name: 'Gymnasium', category: 'Fitness' },
  { name: 'Spa & Sauna', category: 'Wellness' },
  { name: 'Swimming Pool', category: 'Sports' },
  { name: 'Yoga Pavilion', category: 'Fitness' },
  { name: 'Business Centre', category: 'Work' },
  { name: 'Co-work Lounge', category: 'Work' },
];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { property_id } = req.query || {};
      if (property_id) {
        const { data, error } = await supabase.from('property_amenities').select('amenity_id, amenities(*)').eq('property_id', property_id);
        if (error) throw error;
        return res.status(200).json((data || []).map((r) => r.amenities).filter(Boolean));
      }
      let { data, error } = await supabase.from('amenities').select('*').order('name');
      if (error) throw error;
      if (!data || data.length === 0) {
        const { data: seeded, error: seedErr } = await supabase.from('amenities').insert(DEFAULT_AMENITIES).select('*');
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
        }
      }
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { name, icon, category } = req.body || {};
      const clean = cleanStr(name, 120);
      if (!clean) return res.status(400).json({ error: 'Name required' });
      // Check if existing (case-insensitive)
      const { data: existing } = await supabase.from('amenities').select('*').ilike('name', clean).maybeSingle();
      if (existing) {
        return res.status(200).json(existing);
      }
      const { data, error } = await supabase.from('amenities').insert({ name: clean, icon: cleanStr(icon, 60), category: cleanStr(category, 80) || 'General' }).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'amenity', data.id, { name: clean });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, name, icon, category } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = {};
      if (name !== undefined) body.name = cleanStr(name, 120);
      if (icon !== undefined) body.icon = cleanStr(icon, 60);
      if (category !== undefined) body.category = cleanStr(category, 80);
      const { data, error } = await supabase.from('amenities').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'amenity', id);
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      await supabase.from('property_amenities').delete().eq('amenity_id', id);
      const { error } = await supabase.from('amenities').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'amenity', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API amenities error:', err); res.status(500).json({ error: err.message }); }
}
