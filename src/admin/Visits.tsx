import { useEffect, useState } from 'react';
import { Loader2, Trash2, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, inputCls, btnGhost, StatusPill } from './ui';

const V_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

export default function AdminVisits() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '200' });
    if (status) q.set('status', status);
    if (onlyUpcoming) q.set('upcoming', 'true');
    apiGet(`/api/site-visits?${q.toString()}`).then((r) => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [status, onlyUpcoming]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (id: number, patch: Record<string, unknown>) => {
    await apiMut('/api/site-visits', 'PUT', { id, ...patch });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this visit?')) return;
    await apiMut('/api/site-visits', 'DELETE', { id });
    load();
  };

  const grouped: Record<string, any[]> = {};
  items.forEach((v) => { (grouped[v.visit_date] = grouped[v.visit_date] || []).push(v); });

  return (
    <div className="space-y-5">
      <SEO title="Site Visits" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CRM · Tours</div>
          <h1 className="font-serif text-ink text-3xl">Site Visits <span className="text-lg text-ink/40">({items.length})</span></h1>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
            <input type="checkbox" checked={onlyUpcoming} onChange={(e) => setOnlyUpcoming(e.target.checked)} className="accent-[#b98a2f] w-4 h-4" /> Upcoming only
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' !w-auto'}>
            <option value="">All statuses</option>
            {V_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Card>
        <CardHead title="Tour calendar" sub="Grouped by date — update status inline" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty text="No visits scheduled. Website bookings land here automatically." /> : (
          <div className="divide-y divide-ink/10">
            {Object.entries(grouped).map(([date, vs]) => (
              <div key={date} className="px-5 py-4">
                <div className="text-xs tracking-[0.25em] uppercase text-gold-dark font-semibold mb-3">{new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {vs.length} visit{vs.length > 1 ? 's' : ''}</div>
                <div className="space-y-2.5">
                  {vs.map((v) => (
                    <div key={v.id} className="border border-ink/10 p-4 flex flex-col lg:flex-row lg:items-center gap-3 hover:border-gold/40 transition">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink">{v.visitor_name} <a href={`tel:${v.visitor_phone}`} className="font-normal text-gold-dark text-sm ml-1 inline-flex items-center gap-1"><Phone size={12} />{v.visitor_phone}</a></div>
                        <div className="text-sm text-ink/55 truncate">{v.visit_time} · {v.properties?.title || 'General visit'}{v.properties?.locality ? ` (${v.properties.locality})` : ''}</div>
                        {v.notes && <div className="text-xs text-ink/45 mt-1">{v.notes}</div>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input value={v.agent || ''} onChange={(e) => { const nv = items.map((x) => x.id === v.id ? { ...x, agent: e.target.value } : x); setItems(nv); }} onBlur={(e) => update(v.id, { agent: e.target.value || null })} placeholder="Agent" className={inputCls + ' !w-32 !py-1.5'} />
                        <select value={v.status} onChange={(e) => update(v.id, { status: e.target.value })} className={inputCls + ' !w-auto !py-1.5'}>
                          {V_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <StatusPill status={v.status} />
                        {isAdmin && <button onClick={() => remove(v.id)} className={btnGhost + ' !py-1.5'}><Trash2 size={13} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
