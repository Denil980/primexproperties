import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, Eye } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, formatINR, timeAgo } from '../lib/api';
import { Card, CardHead, Stat, Bar, StatusPill, Empty } from './ui';

export default function AdminDashboard() {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/dashboard').then(setD).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gold-dark" size={32} /></div>;
  if (error) return <div className="bg-white border border-red-200 text-red-600 p-6 text-sm">Failed to load dashboard: {error}</div>;

  const c = d.counts;
  const maxDay = Math.max(1, ...Object.values(d.leadsByDay || {}).map(Number));
  const days = Object.entries(d.leadsByDay || {}).sort().slice(-14);

  return (
    <div className="space-y-6">
      <SEO title="Admin Dashboard" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Command centre</div>
          <h1 className="font-serif text-ink text-3xl">Dashboard</h1>
        </div>
        <Link to="/admin/properties" className="bg-ink text-gold px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-gold hover:text-ink transition">+ New Listing</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Live Listings" value={c.activeProps} sub={`${c.properties} total in inventory`} />
        <Stat label="Total Leads" value={c.leads} sub={`${c.newLeadsWeek} new this week`} />
        <Stat label="Upcoming Visits" value={c.upcomingVisits} sub="Scheduled + confirmed" />
        <Stat label="Listing Views" value={c.totalViews.toLocaleString('en-IN')} sub={`${c.projects} projects · ${c.developers} developers`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Lead pipeline" sub="By status" action={<Link to="/admin/leads" className="text-xs tracking-widest uppercase text-gold-dark hover:underline flex items-center gap-1">CRM <ArrowRight size={13} /></Link>} />
          <div className="p-5 space-y-3">
            {Object.entries(d.leadsByStatus || {}).map(([s, n]) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-36 shrink-0"><StatusPill status={s} /></div>
                <div className="flex-1"><Bar pct={(Number(n) / Math.max(1, c.leads)) * 100} /></div>
                <div className="w-8 text-right text-sm font-medium">{Number(n)}</div>
              </div>
            ))}
            {Object.keys(d.leadsByStatus || {}).length === 0 && <Empty text="No leads yet — enquiries will appear here." />}
          </div>
        </Card>
        <Card>
          <CardHead title="Leads — last 14 days" sub="Daily enquiry volume" action={<Link to="/admin/analytics" className="text-xs tracking-widest uppercase text-gold-dark hover:underline flex items-center gap-1">Analytics <ArrowRight size={13} /></Link>} />
          <div className="p-5">
            {days.length === 0 ? <Empty text="No activity in this period." /> : (
              <div className="flex items-end gap-1.5 h-40">
                {days.map(([day, n]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5" title={`${day}: ${n}`}>
                    <span className="text-[10px] text-ink/50">{Number(n) || ''}</span>
                    <div className="w-full bg-gold/80 hover:bg-gold transition" style={{ height: `${Math.max(4, (Number(n) / maxDay) * 110)}px` }} />
                    <span className="text-[9px] text-ink/40 -rotate-45 origin-top mt-1">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Most viewed listings" sub="All-time views" action={<Link to="/admin/properties" className="text-xs tracking-widest uppercase text-gold-dark hover:underline">Manage</Link>} />
          <div className="divide-y divide-ink/5">
            {(d.topProperties || []).map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream transition">
                <img src={p.cover_image || '/images/tower-a.jpg'} alt="" className="w-14 h-11 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink truncate">{p.title}</div>
                  <div className="text-xs text-ink/45">{p.locality} · {formatINR(p.price)}</div>
                </div>
                <span className="flex items-center gap-1 text-xs text-ink/50"><Eye size={13} /> {p.views || 0}</span>
              </Link>
            ))}
            {(d.topProperties || []).length === 0 && <Empty />}
          </div>
        </Card>
        <Card>
          <CardHead title="Latest enquiries" sub="Fresh from the website" action={<Link to="/admin/leads" className="text-xs tracking-widest uppercase text-gold-dark hover:underline flex items-center gap-1">All leads <ArrowRight size={13} /></Link>} />
          <div className="divide-y divide-ink/5">
            {(d.recentLeads || []).map((l: any) => (
              <div key={l.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-ink font-medium truncate">{l.name} <span className="font-normal text-ink/45">· {l.phone}</span></span>
                  <StatusPill status={l.status} />
                </div>
                <div className="text-xs text-ink/45 mt-1 truncate">{l.properties?.title || l.projects?.name || l.preferred_locality || l.interest_type} · {timeAgo(l.created_at)}</div>
              </div>
            ))}
            {(d.recentLeads || []).length === 0 && <Empty text="No enquiries yet." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
