import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiMut } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import SignInPrompt from './SignInPrompt';

interface FavCtx {
  favIds: Set<number>;
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<FavCtx>({ favIds: new Set(), isFav: () => false, toggleFav: async () => {}, loading: false });

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setFavIds(new Set()); return; }
    apiGet('/api/favorites').then((rows) => {
      setFavIds(new Set((rows || []).map((r: { property_id: number }) => r.property_id)));
    }).catch(() => {});
  }, [user]);

  // Complete the pending save right after the user returns from login
  useEffect(() => {
    if (user && pendingId != null) {
      const id = pendingId;
      setPendingId(null);
      setFavIds((prev) => new Set(prev).add(id));
      apiMut('/api/favorites', 'POST', { property_id: id }).catch(() => {});
    }
  }, [user, pendingId]);

  const isFav = useCallback((id: number) => favIds.has(id), [favIds]);

  const toggleFav = useCallback(async (id: number) => {
    if (!user) {
      // Gentle prompt (no aggressive popup, no forced redirect)
      setPendingId(id);
      setPromptOpen(true);
      return;
    }
    const wasFav = favIds.has(id);
    setFavIds((prev) => { const n = new Set(prev); if (wasFav) n.delete(id); else n.add(id); return n; });
    try {
      if (wasFav) await apiMut('/api/favorites', 'DELETE', { property_id: id });
      else await apiMut('/api/favorites', 'POST', { property_id: id });
    } catch (e) {
      console.error(e);
      setFavIds((prev) => { const n = new Set(prev); if (wasFav) n.add(id); else n.delete(id); return n; });
    }
  }, [user, favIds]);

  const goLogin = () => {
    setPromptOpen(false);
    navigate('/login', { state: { from: window.location.pathname + window.location.search, reason: 'To save homes you love, sign in once — it takes 20 seconds.' } });
  };

  return (
    <Ctx.Provider value={{ favIds, isFav, toggleFav, loading }}>
      {children}
      <SignInPrompt
        open={promptOpen}
        onClose={() => { setPromptOpen(false); setPendingId(null); }}
        onSignIn={goLogin}
        title="Save this home?"
        message="Sign in to keep a shortlist of homes you love, synced across devices. Browsing stays free forever."
      />
    </Ctx.Provider>
  );
}

export const useFavorites = () => useContext(Ctx);
