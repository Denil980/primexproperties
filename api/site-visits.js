import supabase from './db-client.js';
import { requireRole, getAuthUser, getProfileForUser, setCors, SALES_ROLES, ADMIN_ROLES, normalizeRole, cleanStr, isValidEmail, isValidPhone, looksSpammy, audit } from './_auth.js';
const SELECT = '*, properties(id,title,slug,cover_image,price,locality,address), leads(id,name,phone,email)';
const V_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { status, property_id, upcoming, limit } = q0;
      const viewer = await getAuthUser(req);
      const viewerProfile = viewer ? await getProfileForUser(viewer) : null;
      const viewerRole = normalizeRole(viewerProfile?.role);
      const isSalesStaff = SALES_ROLES.includes(viewerRole);
      // Staff see the schedule; sales_agent sees only their own agent-tagged visits;
      // signed-in customers see only their own visits. Guests see nothing.
      if (!viewer) return res.status(401).json({ error: 'Please sign in to view site visits.' });
      let q = supabase.from('site_visits').select(SELECT, { count: 'exact' }).order('visit_date', { ascending: true }).order('id', { ascending: false });
      if (isSalesStaff) {
        if (viewerRole === 'sales_agent') {
          const me = [viewerProfile?.full_name, viewer.email].filter(Boolean);
          if (!me.length) return res.status(200).json({ data: [], total: 0 });
          q = q.or(me.map((v) => `agent.eq.${v}`).join(','));
        }
        if (status) q = q.in('status', String(status).split(',').filter((s) => V_STATUSES.includes(s.trim())));
        if (property_id) q = q.eq('property_id', property_id);
      } else {
        const clauses = [];
        if (viewer.email) clauses.push(`visitor_email.eq.${viewer.email}`);
        const vp = viewerProfile?.phone || viewer.phone;
        if (vp) clauses.push(`visitor_phone.eq.${vp}`);
        if (!clauses.length) return res.status(200).json({ data: [], total: 0 });
        q = q.or(clauses.join(','));
      }
      if (upcoming === 'true') { const today = new Date().toISOString().slice(0, 10); q = q.gte('visit_date', today).in('status', ['Scheduled', 'Confirmed']); }
      if (limit) q = q.limit(Math.min(Number(limit), 200));
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length });
    }
    if (req.method === 'POST') {
      // Public guest bookings allowed — strictly validated + honeypot-checked
      const body = req.body || {};
      if (body.website || body.company_url) return res.status(201).json({ ok: true });
      const visitor_name = cleanStr(body.visitor_name, 120);
      const visitor_phone = cleanStr(body.visitor_phone, 25);
      const visitor_email = cleanStr(body.visitor_email, 160);
      const visit_date = cleanStr(body.visit_date, 20);
      const visit_time = cleanStr(body.visit_time, 20) || '11:00 AM';
      const notes = cleanStr(body.notes, 2000);
      if (!visitor_name || !visitor_phone || !visit_date) return res.status(400).json({ error: 'Name, phone and visit date are required' });
      if (!isValidPhone(visitor_phone)) return res.status(400).json({ error: 'Please enter a valid phone number' });
      if (visitor_email && !isValidEmail(visitor_email)) return res.status(400).json({ error: 'Please enter a valid email address' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(visit_date)) return res.status(400).json({ error: 'Invalid visit date' });
      if (visit_date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ error: 'Visit date cannot be in the past' });
      if (looksSpammy(visitor_name, notes)) return res.status(400).json({ error: 'Submission looks like spam. Please call us directly.' });
      const property_id = body.property_id && !Number.isNaN(Number(body.property_id)) ? Number(body.property_id) : null;
      let leadId = body.lead_id && !Number.isNaN(Number(body.lead_id)) ? Number(body.lead_id) : null;
      if (!leadId) {
        const { data: lead } = await supabase.from('leads').insert({ name: visitor_name, phone: visitor_phone, email: visitor_email, source: cleanStr(body.source, 60) || 'Site Visit', interest_type: 'Site Visit', property_id, status: 'Site Visit Scheduled', message: notes ? `Site visit requested: ${notes}` : 'Site visit requested', score: 55 }).select().single();
        leadId = lead?.id || null;
      } else {
        await supabase.from('leads').update({ status: 'Site Visit Scheduled', updated_at: new Date().toISOString() }).eq('id', leadId);
      }
      const { data, error } = await supabase.from('site_visits').insert({ lead_id: leadId, property_id, visitor_name, visitor_phone, visitor_email, visit_date, visit_time, status: 'Scheduled', agent: null, notes }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, SALES_ROLES);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: existing } = await supabase.from('site_visits').select('id,agent').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Visit not found' });
      if (auth.role === 'sales_agent') {
        const me = [auth.profile?.full_name, auth.user?.email].filter(Boolean);
        if (!me.includes(existing.agent)) return res.status(403).json({ error: 'You can only update visits assigned to you.' });
      }
      const body = {};
      if (rest.status !== undefined) { if (!V_STATUSES.includes(rest.status)) return res.status(400).json({ error: 'Invalid status' }); body.status = rest.status; }
      if (rest.visit_date !== undefined) { const d = cleanStr(rest.visit_date, 20); if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return res.status(400).json({ error: 'Invalid visit date' }); body.visit_date = d; }
      if (rest.visit_time !== undefined) body.visit_time = cleanStr(rest.visit_time, 20);
      if (rest.agent !== undefined) body.agent = cleanStr(rest.agent, 120);
      if (rest.notes !== undefined) body.notes = cleanStr(rest.notes, 4000);
      if (rest.visitor_name !== undefined) body.visitor_name = cleanStr(rest.visitor_name, 120);
      if (rest.visitor_email !== undefined) { const e = cleanStr(rest.visitor_email, 160); if (e && !isValidEmail(e)) return res.status(400).json({ error: 'Invalid email' }); body.visitor_email = e; }
      if (rest.visitor_phone !== undefined) { const p = cleanStr(rest.visitor_phone, 25); if (p && !isValidPhone(p)) return res.status(400).json({ error: 'Invalid phone' }); body.visitor_phone = p; }
      const { data, error } = await supabase.from('site_visits').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'site_visit', id, { status: body.status });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('site_visits').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'site_visit', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API site-visits error:', err); res.status(500).json({ error: err.message }); }
}
