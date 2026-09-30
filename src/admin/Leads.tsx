import { useEffect, useState } from 'react';
import { Loader2, Search, Trash2, X, Phone, Mail, CalendarPlus } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, formatINR, timeAgo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost, StatusPill } from './ui';

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Closed', 'Lost'];

export default function AdminLeads() {
  const { isAdmin, role, profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kw, setKw] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [visitForm, setVisitForm] = useState({ visit_date: '', visit_time: '11:00 AM' });

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '100' });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    apiGet(`/api/leads?${q.toString()}`).then((r) => { setItems(r.data || []); setTotal(r.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (selected) { setNote(selected.notes || ''); } }, [selected]);

  const updateLead = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const updated = await apiMut('/api/leads', 'PUT', { id: selected.id, ...patch });
      setSelected(updated);
      load();
    } finally {
      setSaving(false);
    }
  };

  const bookVisit = async () => {
    if (!visitForm.visit_date) { alert('Pick a date first.'); return; }
    setSaving(true);
    try {
      await apiMut('/api/site-visits', 'POST', {
        lead_id: selected.id, property_id: selected.property_id,
        visitor_name: selected.name, visitor_phone: selected.phone, visitor_email: selected.email,
        visit_date: visitForm.visit_date, visit_time: visitForm.visit_time, source: 'CRM',
      });
      setSelected({ ...selected, status: 'Site Visit Scheduled' });
      setVisitForm({ visit_date: '', visit_time: '11:00 AM' });
      load();
      alert('Site visit booked.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    await apiMut('/api/leads', 'DELETE', { id });
    setSelected(null);
    load();
  };

  const scoreColor = (s: number) => s >= 70 ? 'text-emerald-700' : s >= 45 ? 'text-amber-600' : 'text-ink/50';

  return (
    <div className="space-y-5">
      <SEO title="Leads CRM" />
      <div>
        <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CRM</div>
        <h1 className="font-serif text-ink text-3xl">Leads <span className="text-lg text-ink/40">({total})</span></h1>
        {role === 'sales_agent' && <p className="text-xs text-ink/50 mt-1">Showing leads assigned to {profile?.full_name || 'you'} only.</p>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHead title="Pipeline" sub="Click a lead to manage" action={
            <div className="flex gap-2">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' !w-auto !py-2'}>
                <option value="">All statuses</option>
                {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearch(kw.trim())} placeholder="Search…" className={inputCls + ' !pl-8 !w-40 !py-2'} />
              </div>
            </div>
          } />
          {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty text="No leads match. Website enquiries land here automatically." /> : (
            <div className="divide-y divide-ink/5 max-h-[640px] overflow-y-auto">
              {items.map((l) => (
                <button key={l.id} onClick={() => setSelected(l)} className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition ${selected?.id === l.id ? 'bg-gold/10' : 'hover:bg-cream/70'}`}>
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-serif text-lg border ${selected?.id === l.id ? 'bg-ink text-gold border-ink' : 'bg-cream text-ink/60 border-ink/10'}`}>{l.name?.[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink truncate">{l.name}</span>
                      <span className={`text-xs font-semibold ${scoreColor(l.score || 0)}`}>{l.score}</span>
                    </div>
                    <div className="text-xs text-ink/50 truncate">{l.phone}{l.email ? ` · ${l.email}` : ''} · {l.properties?.title || l.projects?.name || l.preferred_locality || l.interest_type} · {timeAgo(l.created_at)}</div>
                  </div>
                  <StatusPill status={l.status} />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2">
          {!selected ? <Empty text="Select a lead to view details, add notes, change status or book a site visit." /> : (
            <div>
              <div className="flex items-start justify-between px-5 py-4 border-b border-ink/10">
                <div>
                  <h2 className="font-serif text-xl text-ink">{selected.name}</h2>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-ink/55">
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1 hover:text-gold-dark"><Phone size={12} /> {selected.phone}</a>
                    {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-1 hover:text-gold-dark"><Mail size={12} /> {selected.email}</a>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-ink/40 hover:text-ink"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[11px] uppercase tracking-widest text-ink/45">Source</span><div>{selected.source}</div></div>
                  <div><span className="text-[11px] uppercase tracking-widest text-ink/45">Interest</span><div>{selected.interest_type}</div></div>
                  <div><span className="text-[11px] uppercase tracking-widest text-ink/45">Budget</span><div>{selected.budget_max ? `Up to ${formatINR(selected.budget_max)}` : selected.budget_min ? `${formatINR(selected.budget_min)}+` : '—'}</div></div>
                  <div><span className="text-[11px] uppercase tracking-widest text-ink/45">Locality</span><div>{selected.preferred_locality || '—'}</div></div>
                  <div className="col-span-2"><span className="text-[11px] uppercase tracking-widest text-ink/45">Linked to</span><div>{selected.properties?.title || selected.projects?.name || '—'}</div></div>
                  {selected.message && <div className="col-span-2"><span className="text-[11px] uppercase tracking-widest text-ink/45">Message</span><div className="bg-cream border border-ink/10 p-3 text-sm mt-1">{selected.message}</div></div>}
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEAD_STATUSES.map((s) => (
                      <button key={s} disabled={saving} onClick={() => updateLead({ status: s })} className={`px-2.5 py-1.5 text-[11px] border transition ${selected.status === s ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60 hover:border-gold'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Assign to</label><input value={selected.assigned_to || ''} onChange={(e) => setSelected({ ...selected, assigned_to: e.target.value })} onBlur={() => updateLead({ assigned_to: selected.assigned_to })} className={inputCls} placeholder="Agent name" /></div>
                  <div><label className={labelCls}>Follow-up date</label><input type="date" value={selected.follow_up_date || ''} onChange={(e) => setSelected({ ...selected, follow_up_date: e.target.value })} onBlur={() => updateLead({ follow_up_date: selected.follow_up_date || null })} className={inputCls} /></div>
                </div>

                <div>
                  <label className={labelCls}>Internal notes</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputCls} placeholder="Call outcome, objections, next step…" />
                  <button disabled={saving} onClick={() => updateLead({ notes: note })} className={btnGhost + ' mt-2'}>Save notes</button>
                </div>

                <div className="border border-gold/40 bg-gold/5 p-4">
                  <div className="text-xs tracking-[0.18em] uppercase text-gold-dark flex items-center gap-1.5"><CalendarPlus size={14} /> Book site visit</div>
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <input type="date" value={visitForm.visit_date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })} className={inputCls} />
                    <select value={visitForm.visit_time} onChange={(e) => setVisitForm({ ...visitForm, visit_time: e.target.value })} className={inputCls}>
                      {['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '5:30 PM'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button disabled={saving} onClick={bookVisit} className={btnPrimary + ' mt-2.5 w-full'}>Confirm Visit</button>
                </div>

                {isAdmin && (
                  <button onClick={() => remove(selected.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1.5"><Trash2 size={13} /> Delete lead</button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
