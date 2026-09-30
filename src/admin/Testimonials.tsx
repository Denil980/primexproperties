import { useEffect, useState } from 'react';
import { Loader2, Trash2, Check, Star } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, timeAgo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, btnGhost } from './ui';

export default function AdminTestimonials() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    const q = filter ? `?approved=${filter}` : '';
    apiGet(`/api/testimonials${q}`).then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (t: any) => {
    await apiMut('/api/testimonials', 'PUT', { id: t.id, approved: !t.approved });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    await apiMut('/api/testimonials', 'DELETE', { id });
    load();
  };

  return (
    <div className="space-y-5">
      <SEO title="Testimonials" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS · Social proof</div>
          <h1 className="font-serif text-ink text-3xl">Testimonials</h1>
        </div>
        <div className="flex gap-2">
          {[['', 'All'], ['true', 'Approved'], ['false', 'Pending']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition ${filter === v ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60'}`}>{l}</button>
          ))}
        </div>
      </div>
      <Card>
        <CardHead title="Client stories" sub="Approve to publish on homepage" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="divide-y divide-ink/5">
            {items.map((t) => (
              <div key={t.id} className="px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="text-xs text-ink/45">{t.locality}</span>
                    <span className="flex items-center gap-0.5 text-xs text-gold-dark"><Star size={11} fill="currentColor" /> {t.rating}</span>
                    <span className="text-[11px] text-ink/35">{timeAgo(t.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink/65 mt-1.5 italic font-light">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] px-2.5 py-1 border ${t.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{t.approved ? 'Live' : 'Pending'}</span>
                  <button onClick={() => approve(t)} className={btnGhost + ' !py-1.5 flex items-center gap-1.5'}><Check size={13} /> {t.approved ? 'Unpublish' : 'Approve'}</button>
                  {isAdmin && <button onClick={() => remove(t.id)} className={btnGhost + ' !py-1.5'}><Trash2 size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
