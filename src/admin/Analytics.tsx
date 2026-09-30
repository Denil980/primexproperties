import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet } from '../lib/api';
import { Card, CardHead, Stat, Bar, Empty } from './ui';

export default function AdminAnalytics() {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/analytics?days=${days}`).then(setD).catch(() => setD(null)).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gold-dark" size={30} /></div>;
  if (!d) return <div className="bg-white border border-ink/10 p-8 text-ink/60">No analytics data yet — events are tracked automatically as visitors browse.</div>;

  const maxPage = Math.max(1, ...Object.values(d.byPage || {}).map(Number));
  const maxDay = Math.max(1, ...Object.values(d.byDay || {}).map(Number));
  const total = Math.max(1, d.total);

  return (
    <div className="space-y-5">
      <SEO title="Analytics" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Growth</div>
          <h1 className="font-serif text-ink text-3xl">Analytics</h1>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((n) => (
            <button key={n} onClick={() => setDays(n)} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition ${days === n ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60'}`}>{n}d</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total events" value={d.total} sub={`Last ${days} days`} />
        <Stat label="Property views" value={d.byType?.property_view || 0} sub="Detail page opens" />
        <Stat label="Page views" value={d.byType?.page_view || 0} sub="Tracked pages" />
        <Stat label="Top pages" value={Object.keys(d.byPage || {}).length} sub="Distinct routes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Events by type" />
          <div className="p-5 space-y-3">
            {Object.entries(d.byType || {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-32 text-sm text-ink/70 truncate">{k}</div>
                <div className="flex-1"><Bar pct={(Number(v) / total) * 100} /></div>
                <div className="w-10 text-right text-sm font-medium">{Number(v)}</div>
              </div>
            ))}
            {Object.keys(d.byType || {}).length === 0 && <Empty />}
          </div>
        </Card>
        <Card>
          <CardHead title="Top pages" />
          <div className="p-5 space-y-3">
            {Object.entries(d.byPage || {}).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 10).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-44 text-sm text-ink/70 truncate font-mono text-xs">{k}</div>
                <div className="flex-1"><Bar pct={(Number(v) / maxPage) * 100} color="bg-ink" /></div>
                <div className="w-10 text-right text-sm font-medium">{Number(v)}</div>
              </div>
            ))}
            {Object.keys(d.byPage || {}).length === 0 && <Empty />}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Daily activity" sub={`Last ${days} days`} />
        <div className="p-5">
          {Object.keys(d.byDay || {}).length === 0 ? <Empty /> : (
            <div className="flex items-end gap-1 h-44">
              {Object.entries(d.byDay || {}).sort().map(([day, n]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${n}`}>
                  <div className="w-full bg-gold/80 hover:bg-gold transition" style={{ height: `${Math.max(3, (Number(n) / maxDay) * 120)}px` }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
