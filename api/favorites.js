import supabase from './db-client.js';
import { getAuthUser, getProfileForUser, setCors } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to manage favourites' });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('favorites').select('*, properties(*, projects(name), developers(name))').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const { property_id } = req.body || {};
      if (!property_id) return res.status(400).json({ error: 'property_id required' });
      const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('property_id', property_id).maybeSingle();
      if (existing) return res.status(200).json(existing);
      const { data, error } = await supabase.from('favorites').insert({ user_id: user.id, property_id }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { property_id, id } = req.body || {};
      if (!property_id && !id) return res.status(400).json({ error: 'property_id or id required' });
      let q = supabase.from('favorites').delete().eq('user_id', user.id);
      if (property_id) q = q.eq('property_id', property_id); else q = q.eq('id', id);
      const { error } = await q;
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API favorites error:', err); res.status(500).json({ error: err.message }); }
}
