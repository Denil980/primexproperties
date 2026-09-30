import supabase from './db-client.js';
import { requireRole, setCors, SALES_ROLES, ADMIN_ROLES, cleanStr, isValidEmail, isValidPhone, looksSpammy, audit } from './_auth.js';
const SELECT = '*, properties(id,title,slug,cover_image,price,locality), projects(id,name,slug,cover_image,locality)';
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Closed', 'Lost'];
const INTEREST_TYPES = ['Buy', 'Rent', 'Site Visit', 'Callback', 'Sell / List Property', 'Investment Advisory'];

// Names a sales_agent may use to identify themselves (matches assigned_to / agent convention)
function agentIdentity(auth) {
  const p = auth?.profile || {};
  const ids = [p.full_name, auth?.user?.email].filter(Boolean);
  return ids;
}

function scopeToAgent(q, auth) {
  // sales_agent sees/edits ONLY assigned leads; managers+ see all
  if (auth.role === 'sales_agent') {
    const ids = agentIdentity(auth);
    if (!ids.length) return { blocked: true };
    const ors = ids.map((v) => `assigned_to.eq.${v}`).join(',');
    q = q.or(ors);
  }
  return { q };
}

function scoreLead(l) {
  let s = 10;
  if (l.phone) s += 20;
  if (l.email) s += 10;
  if (l.budget_max || l.budget_min) s += 15;
  if (l.property_id || l.project_id) s += 15;
  if (l.message && l.message.length > 20) s += 10;
  if (l.preferred_locality) s += 10;
  return Math.min(s, 100);
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const auth = await requireRole(req, res, SALES_ROLES);
      if (!auth) return;
      const q0 = req.query || {};
      const { status, search, assigned_to, limit, page } = q0;
      let q = supabase.from('leads').select(SELECT, { count: 'exact' }).order('created_at', { ascending: false });
      const scoped = scopeToAgent(q, auth);
      if (scoped.blocked) return res.status(200).json({ data: [], total: 0 });
      q = scoped.q;
      if (status) q = q.in('status', String(status).split(',').filter((s) => LEAD_STATUSES.includes(s.trim())));
      if (assigned_to && auth.role !== 'sales_agent') q = q.eq('assigned_to', cleanStr(assigned_to, 120));
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 60); if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`); }
      const lim = Math.min(Number(limit) || 50, 200);
      const pg = Math.max(Number(page) || 1, 1);
      q = q.range((pg - 1) * lim, pg * lim - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length });
    }
    if (req.method === 'POST') {
      // Public guest enquiries allowed — but strictly validated + honeypot-checked
      const body = req.body || {};
      if (body.website || body.company_url) return res.status(201).json({ ok: true }); // honeypot: pretend success
      const name = cleanStr(body.name, 120);
      const phone = cleanStr(body.phone, 25);
      const email = cleanStr(body.email, 160);
      const message = cleanStr(body.message, 2000);
      const preferred_locality = cleanStr(body.preferred_locality, 120);
      if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
      if (!isValidPhone(phone)) return res.status(400).json({ error: 'Please enter a valid phone number' });
      if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
      if (looksSpammy(name, message, preferred_locality)) return res.status(400).json({ error: 'Submission looks like spam. Please call us directly.' });
      const interest_type = INTEREST_TYPES.includes(body.interest_type) ? body.interest_type : 'Buy';
      const numOrNull = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
      const payload = { name, email, phone, source: cleanStr(body.source, 60) || 'Website', interest_type, property_id: numOrNull(body.property_id), project_id: numOrNull(body.project_id), budget_min: numOrNull(body.budget_min), budget_max: numOrNull(body.budget_max), preferred_locality, message, status: 'New', assigned_to: null, score: 0 };
      payload.score = scoreLead(payload);
      const { data, error } = await supabase.from('leads').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, SALES_ROLES);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: existing } = await supabase.from('leads').select('id,assigned_to,status').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Lead not found' });
      if (auth.role === 'sales_agent') {
        const ids = agentIdentity(auth);
        if (!ids.includes(existing.assigned_to)) return res.status(403).json({ error: 'You can only update leads assigned to you.' });
      }
      const body = {};
      if (rest.name !== undefined) body.name = cleanStr(rest.name, 120);
      if (rest.email !== undefined) { const e = cleanStr(rest.email, 160); if (e && !isValidEmail(e)) return res.status(400).json({ error: 'Invalid email' }); body.email = e; }
      if (rest.phone !== undefined) { const p = cleanStr(rest.phone, 25); if (p && !isValidPhone(p)) return res.status(400).json({ error: 'Invalid phone' }); body.phone = p; }
      if (rest.status !== undefined) { if (!LEAD_STATUSES.includes(rest.status)) return res.status(400).json({ error: 'Invalid status' }); body.status = rest.status; }
      if (rest.interest_type !== undefined && INTEREST_TYPES.includes(rest.interest_type)) body.interest_type = rest.interest_type;
      if (rest.preferred_locality !== undefined) body.preferred_locality = cleanStr(rest.preferred_locality, 120);
      if (rest.message !== undefined) body.message = cleanStr(rest.message, 2000);
      if (rest.notes !== undefined) body.notes = cleanStr(rest.notes, 4000);
      if (rest.assigned_to !== undefined) body.assigned_to = cleanStr(rest.assigned_to, 120);
      if (rest.follow_up_date !== undefined) body.follow_up_date = cleanStr(rest.follow_up_date, 20);
      if (rest.budget_min !== undefined) body.budget_min = rest.budget_min === null || rest.budget_min === '' ? null : Number(rest.budget_min);
      if (rest.budget_max !== undefined) body.budget_max = rest.budget_max === null || rest.budget_max === '' ? null : Number(rest.budget_max);
      if (rest.score !== undefined) body.score = Math.max(0, Math.min(100, Number(rest.score) || 0));
      body.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from('leads').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'lead', id, { status: body.status, assigned_to: body.assigned_to });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabase.from('site_visits').update({ lead_id: null }).eq('lead_id', id);
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'lead', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API leads error:', err); res.status(500).json({ error: err.message }); }
}
