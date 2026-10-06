import supabase from './db-client.js';
import { requireRole, getAuthUser, setCors, ADMIN_ROLES, ALL_ROLES, normalizeRole, cleanStr, isValidPhone, audit } from './_auth.js';
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id, email, list } = req.query || {};
      if (list === 'all') {
        const auth = await requireRole(req, res, ADMIN_ROLES);
        if (!auth) return;
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (user_id) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user_id).maybeSingle();
        return res.status(200).json(data || null);
      }
      if (email) {
        const { data } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
        return res.status(200).json(data || null);
      }
      return res.status(400).json({ error: 'user_id, email or list=all required' });
    }
    if (req.method === 'POST') {
      const user = await getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { full_name, phone, avatar_url } = req.body || {};
      const { data: existing } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (existing) return res.status(200).json(existing);
      if (user.email) {
        const { data: byEmail } = await supabase.from('profiles').select('*').eq('email', user.email).maybeSingle();
        if (byEmail) {
          const { data, error } = await supabase.from('profiles').update({ user_id: user.id, full_name: full_name || byEmail.full_name, avatar_url: avatar_url || byEmail.avatar_url }).eq('id', byEmail.id).select().single();
          if (error) throw error;
          return res.status(200).json(data);
        }
      }
      const { data, error } = await supabase.from('profiles').insert({ user_id: user.id, email: user.email, full_name: full_name || (user.email ? user.email.split('@')[0] : 'User'), phone: phone || null, avatar_url: avatar_url || null, role: 'customer' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const user = await getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, role, full_name, phone, avatar_url } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: me } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const myRole = normalizeRole(me?.role);
      const isAdmin = myRole === 'admin' || myRole === 'super_admin';
      const isSuperAdmin = myRole === 'super_admin';
      const update = {};
      if (full_name !== undefined) update.full_name = cleanStr(full_name, 120);
      if (phone !== undefined) { const p = cleanStr(phone, 25); if (p && !isValidPhone(p)) return res.status(400).json({ error: 'Invalid phone' }); update.phone = p; }
      if (avatar_url !== undefined) { const a = cleanStr(avatar_url, 500); if (a && !/^https?:\/\//i.test(a) && !a.startsWith('/')) return res.status(400).json({ error: 'Invalid avatar URL' }); update.avatar_url = a; }
      if (role !== undefined) {
        if (!isAdmin) return res.status(403).json({ error: 'Only admins can change roles' });
        const nextRole = normalizeRole(role);
        if (!ALL_ROLES.includes(nextRole)) return res.status(400).json({ error: 'Invalid role' });
        if (nextRole === 'super_admin' && !isSuperAdmin) return res.status(403).json({ error: 'Only a Super Admin can grant Super Admin' });
        if (me?.id === id && nextRole !== myRole && !isSuperAdmin) return res.status(403).json({ error: 'You cannot change your own role' });
        update.role = nextRole;
      }
      if (!isAdmin && me?.id !== id) return res.status(403).json({ error: 'You can only update your own profile' });
      const { data, error } = await supabase.from('profiles').update(update).eq('id', id).select().single();
      if (error) throw error;
      if (update.role) {
        audit(req, { user, profile: me, role: myRole }, 'role_change', 'profile', id, { to: update.role });
        if (data?.user_id) {
          try {
            await supabase.auth.admin.updateUserById(data.user_id, { user_metadata: { role: update.role } });
          } catch (e) {
            console.warn('Auth metadata sync notice:', e?.message || e);
          }
        }
      }
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      if (auth.profile?.id === id) return res.status(400).json({ error: 'You cannot delete your own profile' });
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'profile', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API profiles error:', err); res.status(500).json({ error: err.message }); }
}
