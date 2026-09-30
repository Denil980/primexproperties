import supabase from './db-client.js';
import { requireRole, setCors, SALES_ROLES } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const auth = await requireRole(req, res, SALES_ROLES);
    if (!auth) return;
    const isAgent = auth.role === 'sales_agent';
    const agentIds = [auth.profile?.full_name, auth.user?.email].filter(Boolean);
    const [c1, c2, c3, c4, c5] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('developers').select('*', { count: 'exact', head: true }),
      isAgent ? { count: null } : supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);
    let leadsQ = supabase.from('leads').select('id,status,created_at,assigned_to').order('created_at', { ascending: false }).limit(500);
    if (isAgent && agentIds.length) leadsQ = leadsQ.or(agentIds.map((v) => `assigned_to.eq.${v}`).join(','));
    const { data: leads } = await leadsQ;
    const leadsByStatus = {}; const leadsByDay = {};
    (leads || []).forEach((l) => {
      leadsByStatus[l.status || 'New'] = (leadsByStatus[l.status || 'New'] || 0) + 1;
      const d = (l.created_at || '').slice(0, 10);
      leadsByDay[d] = (leadsByDay[d] || 0) + 1;
    });
    const today = new Date().toISOString().slice(0, 10);
    let visitsQ = supabase.from('site_visits').select('id,status,visit_date,agent').gte('visit_date', today).in('status', ['Scheduled', 'Confirmed']).order('visit_date').limit(50);
    if (isAgent && agentIds.length) visitsQ = visitsQ.or(agentIds.map((v) => `agent.eq.${v}`).join(','));
    const { data: visits } = await visitsQ;
    const { data: topProps } = await supabase.from('properties').select('id,title,locality,views,price,cover_image').order('views', { ascending: false }).limit(5);
    let recentQ = supabase.from('leads').select('*, properties(id,title), projects(id,name)').order('created_at', { ascending: false }).limit(6);
    if (isAgent && agentIds.length) recentQ = recentQ.or(agentIds.map((v) => `assigned_to.eq.${v}`).join(','));
    const { data: recentLeads } = await recentQ;
    const { data: viewsRows } = await supabase.from('properties').select('views').limit(2000);
    const totalViews = (viewsRows || []).reduce((s, r) => s + (r.views || 0), 0);
    const newThisWeek = (leads || []).filter((l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400000).length;
    return res.status(200).json({ counts: { properties: c1.count || 0, activeProps: c2.count || 0, projects: c3.count || 0, developers: c4.count || 0, leads: (leads || []).length, upcomingVisits: (visits || []).length, users: c5.count || 0, totalViews, newLeadsWeek: newThisWeek }, leadsByStatus, leadsByDay, upcomingVisits: visits || [], topProperties: topProps || [], recentLeads: recentLeads || [] });
  } catch (err) { console.error('API dashboard error:', err); res.status(500).json({ error: err.message }); }
}
