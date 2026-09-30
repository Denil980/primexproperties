import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ExternalLink, Pencil } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut } from '../lib/api';
import { Card, CardHead, Empty, inputCls, Bar, StatusPill } from './ui';

export default function AdminRera() {
  const [projects, setProjects] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'projects' | 'properties'>('projects');
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      apiGet('/api/projects?limit=100').catch(() => ({ data: [] })),
      apiGet('/api/properties?limit=100&is_active=all').catch(() => ({ data: [] })),
    ]).then(([pr, p]) => { setProjects(pr.data || []); setProps(p.data || []); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateProject = async (id: number, patch: Record<string, unknown>) => {
    await apiMut('/api/projects', 'PUT', { id, ...patch });
    setProjects((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  const updateProp = async (id: number, patch: Record<string, unknown>) => {
    await apiMut('/api/properties', 'PUT', { id, ...patch });
    setProps((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  const approved = projects.filter((p) => p.rera_status === 'Approved').length;
  const pct = projects.length ? Math.round((approved / projects.length) * 100) : 0;
  const propApproved = props.filter((p) => p.rera_approved).length;

  const shownProjects = filter ? projects.filter((p) => (p.rera_status || 'Applied') === filter) : projects;
  const shownProps = filter === 'Approved' ? props.filter((p) => p.rera_approved) : filter === 'Pending' ? props.filter((p) => !p.rera_approved) : props;

  return (
    <div className="space-y-5">
      <SEO title="RERA Tracker" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Compliance</div>
          <h1 className="font-serif text-ink text-3xl flex items-center gap-2.5"><ShieldCheck size={28} className="text-emerald-600" /> MahaRERA Tracker</h1>
        </div>
        <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noreferrer" className="text-xs tracking-[0.15em] uppercase text-gold-dark hover:underline flex items-center gap-1.5">Verify on MahaRERA portal <ExternalLink size={13} /></a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-[11px] tracking-[0.22em] uppercase text-ink/45">Projects RERA-approved</div>
          <div className="font-serif text-3xl text-ink mt-1.5">{approved} / {projects.length}</div>
          <div className="mt-3"><Bar pct={pct} color="bg-emerald-500" /></div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] tracking-[0.22em] uppercase text-ink/45">Listings RERA-flagged</div>
          <div className="font-serif text-3xl text-ink mt-1.5">{propApproved} / {props.length}</div>
          <div className="mt-3"><Bar pct={props.length ? (propApproved / props.length) * 100 : 0} color="bg-emerald-500" /></div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] tracking-[0.22em] uppercase text-ink/45">Needs attention</div>
          <div className="font-serif text-3xl text-ink mt-1.5">{projects.length - approved}</div>
          <div className="text-xs text-ink/50 mt-2">Projects not yet marked Approved</div>
        </Card>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setTab('projects'); setFilter(''); }} className={`px-5 py-2.5 text-xs tracking-[0.15em] uppercase border transition ${tab === 'projects' ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60'}`}>Projects</button>
        <button onClick={() => { setTab('properties'); setFilter(''); }} className={`px-5 py-2.5 text-xs tracking-[0.15em] uppercase border transition ${tab === 'properties' ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60'}`}>Listings</button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputCls + ' !w-auto ml-auto'}>
          <option value="">All</option>
          {tab === 'projects' ? ['Approved', 'Applied', 'Expired', 'Not Applicable'].map((s) => <option key={s}>{s}</option>) : ['Approved', 'Pending'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        <CardHead title={tab === 'projects' ? 'Project RERA register' : 'Listing RERA flags'} sub="Inline editing — changes save on blur/change" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.15em] uppercase text-ink/45 border-b border-ink/10">
                  <th className="px-5 py-3 font-medium">{tab === 'projects' ? 'Project' : 'Listing'}</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">RERA number</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {tab === 'projects' ? (
                  shownProjects.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr> : shownProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3 font-medium">{p.name}</td>
                      <td className="px-3 py-3 text-ink/70">{p.locality}, {p.city}</td>
                      <td className="px-3 py-3">
                        <input defaultValue={p.rera_number || ''} key={`${p.id}-${p.rera_number}`} onBlur={(e) => { if (e.target.value !== (p.rera_number || '')) updateProject(p.id, { rera_number: e.target.value || null }); }} placeholder="P520000…" className={inputCls + ' !py-1.5 !w-44'} />
                      </td>
                      <td className="px-3 py-3">
                        <select value={p.rera_status || 'Applied'} onChange={(e) => updateProject(p.id, { rera_status: e.target.value })} className={inputCls + ' !py-1.5 !w-auto'}>
                          {['Applied', 'Approved', 'Expired', 'Not Applicable'].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3"><StatusPill status={p.rera_status || 'Applied'} /></td>
                    </tr>
                  ))
                ) : (
                  shownProps.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr> : shownProps.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3 font-medium max-w-[300px] truncate">{p.title}</td>
                      <td className="px-3 py-3 text-ink/70">{p.locality}</td>
                      <td className="px-3 py-3">
                        <input defaultValue={p.rera_number || ''} key={`${p.id}-${p.rera_number}`} onBlur={(e) => { if (e.target.value !== (p.rera_number || '')) updateProp(p.id, { rera_number: e.target.value || null }); }} placeholder="P520000…" className={inputCls + ' !py-1.5 !w-44'} />
                      </td>
                      <td className="px-3 py-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={!!p.rera_approved} onChange={(e) => updateProp(p.id, { rera_approved: e.target.checked })} className="accent-emerald-600 w-4 h-4" /> Approved
                        </label>
                      </td>
                      <td className="px-3 py-3">{p.rera_approved ? <StatusPill status="Approved" /> : <span className="text-xs text-ink/40 flex items-center gap-1"><Pencil size={11} /> Pending</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
