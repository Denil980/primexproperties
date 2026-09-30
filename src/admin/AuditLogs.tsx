import { useEffect, useState } from 'react';
import { Loader2, Search, ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, timeAgo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, inputCls, btnGhost } from './ui';

const ACTIONS = ['create', 'update', 'delete', 'role_change', 'upload'];
const ENTITIES = ['property', 'project', 'developer', 'lead', 'site_visit', 'blog_post', 'seo_page', 'testimonial', 'amenity', 'profile', 'media'];

const ACTION_STYLE: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-blue-50 text-blue-700 border-blue-200',
  delete: 'bg-red-50 text-red-600 border-red-200',
  role_change: 'bg-violet-50 text-violet-700 border-violet-200',
  upload: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AdminAuditLogs() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [kw, setKw] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '50', page: String(page) });
    if (action) q.set('action', action);
    if (entity) q.set('entity', entity);
    if (search) q.set('search', search);
    apiGet(`/api/audit-logs?${q.toString()}`).then((r) => { setItems(r.data || []); setTotal(r.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [action, entity, search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-5">
      <SEO title="Audit Logs" />
      <div>
        <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Security · Compliance</div>
        <h1 className="font-serif text-ink text-3xl flex items-center gap-2.5"><ScrollText size={26} className="text-gold-dark" /> Audit Logs <span className="text-lg text-ink/40">({total})</span></h1>
      </div>

      <Card>
        <CardHead
          title="Staff activity trail"
          sub={isAdmin ? 'Every create, update, delete, upload & role change' : 'CRM activity by your sales team'}
          action={
            <div className="flex flex-wrap gap-2">
              <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={inputCls + ' !w-auto !py-2'}>
                <option value="">All actions</option>
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} className={inputCls + ' !w-auto !py-2'}>
                <option value="">All entities</option>
                {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(kw.trim()); setPage(1); } }} placeholder="Actor email…" className={inputCls + ' !pl-8 !w-44 !py-2'} />
              </div>
            </div>
          }
        />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty text="No audit entries yet. Staff actions are logged here automatically." /> : (
          <>
            <div className="divide-y divide-ink/5">
              {items.map((a) => (
                <div key={a.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] px-2.5 py-1 border uppercase tracking-wider ${ACTION_STYLE[a.action] || 'bg-ink/5 text-ink/60 border-ink/10'}`}>{a.action?.replace('_', ' ')}</span>
                    <span className="text-[11px] px-2.5 py-1 border border-ink/10 bg-cream text-ink/60">{a.entity}{a.entity_id ? ` #${a.entity_id}` : ''}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="text-ink font-medium">{a.actor_email || 'system'}</span>
                    <span className="text-ink/40 text-xs ml-2">{a.actor_role}</span>
                    {a.meta && Object.keys(a.meta).length > 0 && (
                      <span className="text-ink/45 text-xs ml-2 truncate">{Object.entries(a.meta).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ').slice(0, 120)}</span>
                    )}
                  </div>
                  <span className="text-xs text-ink/40 shrink-0">{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-ink/10">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost + ' !py-2'}><ChevronLeft size={15} /></button>
                <span className="text-sm text-ink/60 px-2">{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnGhost + ' !py-2'}><ChevronRight size={15} /></button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
