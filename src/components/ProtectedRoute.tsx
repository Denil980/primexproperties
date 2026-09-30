import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../contexts/AuthContext';

// staffOnly: any staff role may enter (admin console hidden from public).
// allow: optional narrower role list for specific screens.
export default function ProtectedRoute({ children, staffOnly = false, allow }: { children: React.ReactNode; staffOnly?: boolean; allow?: Role[] }) {
  const { user, loading, isStaff, role } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/login', { replace: true, state: { from: loc.pathname + loc.search } });
    else if (staffOnly && !isStaff) navigate('/', { replace: true });
    else if (allow && !allow.includes(role)) navigate('/admin', { replace: true });
  }, [user, loading, isStaff, role, staffOnly, allow, navigate, loc.pathname, loc.search]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ink"><div className="font-serif text-gold text-xl tracking-widest animate-pulse">PRIMEX</div></div>;
  if (!user) return null;
  if (staffOnly && !isStaff) return null;
  if (allow && !allow.includes(role)) return null;
  return <>{children}</>;
}
