import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, FolderKanban, Users, UserCheck, CalendarDays, MessageSquareQuote, Newspaper, Search, BarChart3, LogOut, Menu, X, Home, ShieldCheck, ScrollText, MapPin, FileSpreadsheet } from 'lucide-react';
import { useAuth, ROLE_LABELS, type Role } from '../contexts/AuthContext';

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; roles?: Role[] }

const LINKS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['super_admin', 'admin', 'sales_manager', 'sales_agent'] },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/developers', label: 'Developers', icon: Users },
  { to: '/admin/localities', label: 'Localities', icon: MapPin, roles: ['super_admin', 'admin', 'content_manager'] },
  { to: '/admin/leads', label: 'Leads CRM', icon: UserCheck, roles: ['super_admin', 'admin', 'sales_manager', 'sales_agent'] },
  { to: '/admin/visits', label: 'Site Visits', icon: CalendarDays, roles: ['super_admin', 'admin', 'sales_manager', 'sales_agent'] },
  { to: '/admin/rera', label: 'RERA Tracker', icon: ShieldCheck },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, roles: ['super_admin', 'admin', 'content_manager'] },
  { to: '/admin/blog', label: 'Blog CMS', icon: Newspaper, roles: ['super_admin', 'admin', 'content_manager'] },
  { to: '/admin/seo', label: 'SEO Manager', icon: Search, roles: ['super_admin', 'admin', 'content_manager'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'admin', 'sales_manager'] },
  { to: '/admin/users', label: 'Users & Roles', icon: Users, roles: ['super_admin', 'admin'] },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['super_admin', 'admin', 'sales_manager'] },
  { to: '/admin/reports', label: 'Reports', icon: FileSpreadsheet, roles: ['super_admin', 'admin', 'sales_manager'] },
];

export default function AdminLayout() {
  const { profile, role, signOut, can } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = LINKS.filter((l) => !l.roles || can(l.roles));

  const side = (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center px-6 py-5 border-b border-white/10">
        <img src="/images/logo.png" alt="PRIMEX PROPERTIES" className="h-8 w-auto object-contain" />
      </Link>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 text-sm transition ${isActive ? 'bg-gold text-ink font-medium' : 'text-white/65 hover:bg-white/5 hover:text-gold'}`}>
            <l.icon size={17} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:text-gold"><Home size={15} /> View website</Link>
        <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:text-red-400"><LogOut size={15} /> Sign out</button>
        <div className="px-3 pt-1 text-xs text-white/35">{profile?.full_name} · <span className="text-gold/80 uppercase">{ROLE_LABELS[role]}</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f1ea] lg:flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-ink fixed inset-y-0 z-40">{side}</aside>
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ink flex items-center justify-between px-4 h-14">
        <span className="font-serif text-white tracking-[0.2em] text-sm">PRIMEX <span className="text-gold">ADMIN</span></span>
        <button onClick={() => setOpen(!open)} className="text-white p-2" aria-label="Admin menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-ink">{side}</div>
        </div>
      )}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
