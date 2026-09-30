import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import supabase from '../lib/supabase';
import { apiMut } from '../lib/api';
import type { User } from '@supabase/supabase-js';

export type Role = 'super_admin' | 'admin' | 'sales_manager' | 'sales_agent' | 'content_manager' | 'customer';

export const STAFF_ROLES: Role[] = ['super_admin', 'admin', 'sales_manager', 'sales_agent', 'content_manager'];
export const ADMIN_ROLES: Role[] = ['super_admin', 'admin'];
export const SALES_ROLES: Role[] = ['super_admin', 'admin', 'sales_manager', 'sales_agent'];
export const CONTENT_ROLES: Role[] = ['super_admin', 'admin', 'content_manager'];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  sales_manager: 'Sales Manager',
  sales_agent: 'Sales Agent',
  content_manager: 'Content Manager',
  customer: 'Customer',
};

// Legacy 'agent' → sales_agent
export function normalizeRole(role: string | null | undefined): Role {
  if (role === 'agent') return 'sales_agent';
  const all: Role[] = [...STAFF_ROLES, 'customer'];
  return (all as string[]).includes(role || '') ? (role as Role) : 'customer';
}

export interface Profile {
  id: number;
  user_id: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

// Idle session timeout: 12h for customers, 4h for staff (rolling on activity)
const TIMEOUTS: Record<string, number> = { customer: 12 * 3600e3 };
const STAFF_TIMEOUT = 4 * 3600e3;

function timeoutFor(role: string) {
  return STAFF_ROLES.includes(normalizeRole(role)) ? STAFF_TIMEOUT : TIMEOUTS.customer;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  role: Role;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isSales: boolean;
  isContent: boolean;
  can: (roles: Role[]) => boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null, profile: null, role: 'customer', loading: true,
  refreshProfile: async () => {}, signOut: async () => {},
  isSuperAdmin: false, isAdmin: false, isStaff: false, isSales: false, isContent: false,
  can: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User | null) => {
    if (!u) { setProfile(null); return; }
    try {
      const p = await apiMut('/api/profiles', 'POST', { full_name: u.user_metadata?.full_name || u.user_metadata?.name, avatar_url: u.user_metadata?.avatar_url });
      setProfile(p);
    } catch (e) {
      console.error('profile fetch failed', e);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    await fetchProfile(data.session?.user ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      fetchProfile(u).finally(() => setLoading(false));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchProfile(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Rolling idle-session timeout (secure auth flows: auto sign-out on inactivity)
  useEffect(() => {
    if (!user) return;
    const role = normalizeRole(profile?.role);
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      }, timeoutFor(role));
    };
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [user, profile?.role]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const role = normalizeRole(profile?.role);
  const value: AuthCtx = {
    user, profile, role, loading, refreshProfile, signOut,
    isSuperAdmin: role === 'super_admin',
    isAdmin: ADMIN_ROLES.includes(role),
    isStaff: STAFF_ROLES.includes(role),
    isSales: SALES_ROLES.includes(role),
    isContent: CONTENT_ROLES.includes(role),
    can: (roles: Role[]) => roles.includes(role),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
