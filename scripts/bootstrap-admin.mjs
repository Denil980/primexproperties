import { createClient } from '@supabase/supabase-js';

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
let user = usersData.users.find((entry) => entry.email?.toLowerCase() === email);

if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { ...(user.user_metadata || {}), full_name: process.env.ADMIN_FULL_NAME || 'Primex Admin' },
  });
  if (error) throw error;
  user = data.user;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: process.env.ADMIN_FULL_NAME || 'Primex Admin' },
  });
  if (error) throw error;
  user = data.user;
}

const profile = {
  user_id: user.id,
  email,
  full_name: process.env.ADMIN_FULL_NAME || 'Primex Admin',
  role: 'super_admin',
};
const { error: profileError } = await supabase.from('profiles').upsert(profile, { onConflict: 'user_id' });
if (profileError) throw profileError;
console.log(`Admin account is ready for ${email}. Remove ADMIN_PASSWORD from your environment after this one-time setup.`);
