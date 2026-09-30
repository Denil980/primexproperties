import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, CalendarDays, User, Loader2, Trash2, ArrowRight, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiMut, formatINR, timeAgo } from '../lib/api';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'saved' | 'visits' | 'profile'>('saved');
  const [favs, setFavs] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pForm, setPForm] = useState({ full_name: '', phone: '' });
  const [pSaving, setPSaving] = useState(false);
  const [pMsg, setPMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      apiGet('/api/favorites').catch(() => []),
      apiGet('/api/site-visits?limit=100').catch(() => ({ data: [] })),
    ]).then(([f, v]) => {
      setFavs(f || []);
      setVisits(v.data || []);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (profile) setPForm({ full_name: profile.full_name || '', phone: profile.phone || '' });
  }, [profile]);

  const removeFav = async (property_id: number) => {
    await apiMut('/api/favorites', 'DELETE', { property_id });
    setFavs(favs.filter((f) => f.property_id !== property_id));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setPSaving(true);
    setPMsg('');
    try {
      await apiMut('/api/profiles', 'PUT', { id: profile.id, full_name: pForm.full_name, phone: pForm.phone });
      setPMsg('Profile updated.');
    } catch (err) {
      setPMsg(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setPSaving(false);
    }
  };

  const TABS = [
    { v: 'saved', l: 'Saved Homes', icon: Heart },
    { v: 'visits', l: 'My Site Visits', icon: CalendarDays },
    { v: 'profile', l: 'Profile', icon: User },
  ] as const;

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="My Dashboard" />
      <div className="bg-ink pt-32 lg:pt-36 pb-10 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Welcome back</div>
          <h1 className="font-serif text-white text-3xl lg:text-4xl mt-2">{profile?.full_name || user?.email}</h1>
          <div className="flex gap-2 mt-6">
            {TABS.map((t) => (
              <button key={t.v} onClick={() => setTab(t.v)} className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.15em] uppercase border transition ${tab === t.v ? 'bg-gold text-ink border-gold font-semibold' : 'border-white/20 text-white/70 hover:border-gold'}`}>
                <t.icon size={14} /> {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={30} /></div> : (
          <>
            {tab === 'saved' && (
              favs.length === 0 ? (
                <div className="bg-white border border-ink/10 p-14 text-center">
                  <Heart size={40} className="mx-auto text-ink/20" />
                  <div className="font-serif text-2xl text-ink mt-4">No saved homes yet</div>
                  <p className="text-ink/55 text-sm mt-2">Tap the heart on any listing to shortlist it here.</p>
                  <Link to="/properties" className="inline-flex items-center gap-2 mt-6 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">Browse homes <ArrowRight size={15} /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favs.map((f) => {
                    const p = f.properties;
                    if (!p) return null;
                    return (
                      <div key={f.id} className="bg-white border border-ink/10 hover:border-gold/50 transition overflow-hidden">
                        <Link to={`/properties/${p.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                          <img src={p.cover_image || '/images/tower-a.jpg'} alt={p.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </Link>
                        <div className="p-5">
                          <Link to={`/properties/${p.slug}`}><h3 className="font-serif text-lg text-ink hover:text-gold-dark transition line-clamp-1">{p.title}</h3></Link>
                          <div className="text-ink/50 text-sm">{p.locality}, {p.city} · {p.bedrooms} BHK</div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-serif text-xl text-ink">{formatINR(p.price)}</span>
                            <button onClick={() => removeFav(p.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"><Trash2 size={13} /> Remove</button>
                          </div>
                          <div className="text-[11px] text-ink/35 mt-2">Saved {timeAgo(f.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
            {tab === 'visits' && (
              visits.length === 0 ? (
                <div className="bg-white border border-ink/10 p-14 text-center">
                  <CalendarDays size={40} className="mx-auto text-ink/20" />
                  <div className="font-serif text-2xl text-ink mt-4">No site visits scheduled</div>
                  <p className="text-ink/55 text-sm mt-2">Book a private tour — free chauffeured pickup across Navi Mumbai & Thane.</p>
                  <Link to="/properties" className="inline-flex items-center gap-2 mt-6 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">Find a home to visit <ArrowRight size={15} /></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((v) => (
                    <div key={v.id} className="bg-white border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      {v.properties?.cover_image && <img src={v.properties.cover_image} alt="" className="w-full sm:w-32 h-24 object-cover" />}
                      <div className="flex-1">
                        <div className="font-serif text-lg text-ink">{v.properties?.title || 'Property visit'}</div>
                        <div className="text-ink/50 text-sm">{v.visit_date} · {v.visit_time}{v.agent ? ` · Advisor: ${v.agent}` : ''}</div>
                      </div>
                      <span className={`text-xs tracking-[0.15em] uppercase px-3 py-1.5 shrink-0 ${v.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : v.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gold/10 text-gold-dark border border-gold/40'}`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              )
            )}
            {tab === 'profile' && (
              <div className="bg-white border border-ink/10 p-6 lg:p-8 max-w-xl">
                <h2 className="font-serif text-ink text-2xl">Profile settings</h2>
                <form onSubmit={saveProfile} className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-ink/50">Full name</label>
                    <input value={pForm.full_name} onChange={(e) => setPForm({ ...pForm, full_name: e.target.value })} className="w-full mt-1.5 bg-white border border-ink/15 px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-ink/50">Phone</label>
                    <input value={pForm.phone} onChange={(e) => setPForm({ ...pForm, phone: e.target.value })} className="w-full mt-1.5 bg-white border border-ink/15 px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-ink/50">Email</label>
                    <div className="mt-1.5 text-ink/70 text-sm bg-cream border border-ink/10 px-4 py-3">{user?.email}</div>
                  </div>
                  {pMsg && <p className="text-sm text-emerald-700">{pMsg}</p>}
                  <button disabled={pSaving} className="bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase hover:bg-gold hover:text-ink transition disabled:opacity-60">{pSaving ? 'Saving…' : 'Save Changes'}</button>
                </form>
                <div className="mt-8 pt-6 border-t border-ink/10">
                  <div className="text-xs tracking-widest uppercase text-ink/50">Need help?</div>
                  <a href="tel:+912248900000" className="inline-flex items-center gap-2 mt-2 text-ink hover:text-gold-dark"><Phone size={15} /> +91 22 4890 0000</a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
