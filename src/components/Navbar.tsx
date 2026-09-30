import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, User, Phone, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Properties', to: '/properties' },
  { label: 'Projects', to: '/projects' },
  { label: 'Developers', to: '/developers' },
  { label: 'Localities', to: '/localities' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, role, isStaff, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/85 backdrop-blur-xl border-b border-white/10">
      {/* top strip */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-1.5 text-[11px] tracking-widest uppercase text-white/50 border-b border-white/5">
        <span>Mumbai · Navi Mumbai · Thane — MahaRERA Verified Listings</span>
        <div className="flex items-center gap-5">
          <a href="tel:+912248900000" className="flex items-center gap-1.5 hover:text-gold transition"><Phone size={11} /> +91 22 4890 0000</a>
          <span className="text-gold/70">Mon–Sun · 9am–9pm</span>
        </div>
      </div>
      <nav className="flex items-center justify-between px-5 lg:px-10 h-16 lg:h-[72px]">
        <Link to="/" className="flex items-center group">
          <img src="/images/logo.png" alt="PRIMEX PROPERTIES" className="h-8 sm:h-9 lg:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity" />
        </Link>
        <div className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `text-[13px] tracking-[0.14em] uppercase transition relative py-1 after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:bg-gold after:transition-all ${
                  isActive
                    ? 'text-gold font-semibold after:w-full'
                    : 'text-white/70 hover:text-gold after:w-0 hover:after:w-full'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          {user && (
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `w-10 h-10 flex items-center justify-center border transition ${
                  isActive
                    ? 'text-gold border-gold bg-gold/10'
                    : 'border-white/15 text-white/70 hover:text-gold hover:border-gold/50'
                }`
              }
              title="Saved homes"
            >
              <Heart size={17} />
            </NavLink>
          )}
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2.5 pl-1 pr-3 py-1 border border-white/15 hover:border-gold/50 transition">
                <div className="w-8 h-8 bg-gold/15 text-gold flex items-center justify-center text-sm font-semibold">{(profile?.full_name || user.email || 'U')[0].toUpperCase()}</div>
                <span className="text-white/80 text-sm max-w-[110px] truncate">{profile?.full_name || 'Account'}</span>
                <ChevronDown size={14} className="text-white/50" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 mt-2 w-52 bg-ink-2 border border-white/10 shadow-2xl">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-white text-sm font-medium truncate">{profile?.full_name}</div>
                      <div className="text-white/40 text-xs truncate">{user.email}</div>
                      <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest bg-gold/15 text-gold px-2 py-0.5">{ROLE_LABELS[role]}</span>
                    </div>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold"><User size={15} /> My Dashboard</Link>
                    <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold"><Heart size={15} /> Saved Homes</Link>
                    {isStaff && <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold"><LayoutDashboard size={15} /> Admin Panel</Link>}
                    <button onClick={() => { setMenuOpen(false); signOut(); navigate('/'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-red-400 border-t border-white/10"><LogOut size={15} /> Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-[13px] tracking-[0.14em] uppercase text-white/70 hover:text-gold transition px-3 py-2">Sign In</Link>
              <Link to="/login?mode=signup" className="bg-gold text-ink text-[13px] tracking-[0.14em] uppercase font-semibold px-5 py-2.5 hover:bg-white transition">Join Primex</Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-2" aria-label="Menu">{open ? <X size={24} /> : <Menu size={24} />}</button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-ink-2 border-t border-white/10 overflow-hidden">
            <div className="px-6 py-4 flex flex-col">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `py-3 border-b border-white/5 text-sm tracking-[0.14em] uppercase transition ${
                      isActive
                        ? 'text-gold font-semibold pl-2 border-l-2 border-l-gold'
                        : 'text-white/80 hover:text-gold hover:pl-1'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="py-4 flex gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center border border-white/20 text-white py-3 text-sm uppercase tracking-widest">Dashboard</Link>
                    {isStaff && <Link to="/admin" onClick={() => setOpen(false)} className="flex-1 text-center bg-gold text-ink py-3 text-sm uppercase tracking-widest font-semibold">Admin</Link>}
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center border border-white/20 text-white py-3 text-sm uppercase tracking-widest">Sign In</Link>
                    <Link to="/login?mode=signup" onClick={() => setOpen(false)} className="flex-1 text-center bg-gold text-ink py-3 text-sm uppercase tracking-widest font-semibold">Join</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
