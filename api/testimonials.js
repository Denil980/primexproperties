import supabase from './db-client.js';
import { requireRole, setCors, CONTENT_ROLES, ADMIN_ROLES, cleanStr, looksSpammy, audit } from './_auth.js';

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Anish & Sunita Mehta',
    locality: 'Kharghar, Navi Mumbai',
    rating: 5,
    content: 'Primex Properties guided us seamlessly from our first site visit to receiving keys for our 3 BHK golf-course residence in Kharghar. Transparent pricing and complete MahaRERA verification made the journey stress-free.',
    approved: true,
  },
  {
    name: 'Vikram Deshmukh',
    locality: 'Belapur, Navi Mumbai',
    rating: 5,
    content: 'Finding a sea-facing Palm Beach penthouse required local market expertise. The Primex team secured pre-launch pricing and negotiated favorable payment milestones.',
    approved: true,
  },
  {
    name: 'Pooja Kulkarni',
    locality: 'Vashi, Navi Mumbai',
    rating: 5,
    content: 'Extremely professional real estate advisors in Navi Mumbai. They gave honest valuation reports and managed all legal paperwork flawlessly for our Vashi resale flat.',
    approved: true,
  },
];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { approved, limit } = req.query || {};
      let q = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (approved === 'true') q = q.eq('approved', true);
      if (approved === 'false') q = q.eq('approved', false);
      if (limit) q = q.limit(Math.min(Number(limit), 50));
      
      let { data, error } = await q;
      if (error) console.error('Fetch testimonials DB error:', error);

      if (!data || data.length === 0) {
        try {
          const { data: seeded, error: seedErr } = await supabase.from('testimonials').insert(DEFAULT_TESTIMONIALS).select('*');
          if (!seedErr && seeded && seeded.length) {
            data = seeded;
          }
        } catch (_) {}
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      if (b.website || b.company_url) return res.status(201).json({ ok: true });
      const name = cleanStr(b.name, 120);
      const content = cleanStr(b.content, 2000);
      if (!name || !content) return res.status(400).json({ error: 'Name and content required' });
      if (looksSpammy(name, content)) return res.status(400).json({ error: 'Submission looks like spam.' });
      
      const rating = Math.max(1, Math.min(5, Number(b.rating) || 5));
      const approved = b.approved !== undefined ? !!b.approved : true;
      const locality = cleanStr(b.locality, 120) || 'Navi Mumbai';

      const { data, error } = await supabase.from('testimonials')
        .insert({ name, locality, rating, content, avatar_url: null, approved })
        .select()
        .maybeSingle();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, CONTENT_ROLES);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      
      const body = { 
        name: cleanStr(rest.name, 120), 
        locality: cleanStr(rest.locality, 120), 
        content: cleanStr(rest.content, 2000) 
      };
      if (rest.rating !== undefined) body.rating = Math.max(1, Math.min(5, Number(rest.rating) || 5));
      if (rest.approved !== undefined) body.approved = !!rest.approved;
      Object.keys(body).forEach((k) => { if (body[k] === null || body[k] === undefined) delete body[k]; });

      const { data, error } = await supabase.from('testimonials').update(body).eq('id', id).select().maybeSingle();
      if (error) throw error;
      audit(req, auth, 'update', 'testimonial', id, { approved: body.approved });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'testimonial', id);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API testimonials error:', err);
    res.status(500).json({ error: err.message });
  }
}
