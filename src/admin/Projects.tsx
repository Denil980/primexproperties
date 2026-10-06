import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Plus, X, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, formatINR, CITY_AREAS } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost, StatusPill, Pagination } from './ui';

const EMPTY = { name: '', slug: '', description: '', city: 'Navi Mumbai', locality: '', address: '', developer_id: '', status: 'New Launch', configurations: '', price_min: '', price_max: '', total_units: '', tower_count: '', possession_date: '', rera_number: '', rera_status: 'Applied', cover_image: '', amenities_text: '', featured: false };

export default function AdminProjects() {
  const { isAdmin } = useAuth();
  const { showConfirm } = useModal();
  const [items, setItems] = useState<any[]>([]);
  const [devs, setDevs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([apiGet('/api/projects?limit=100').catch(() => ({ data: [] })), apiGet('/api/developers?limit=100').catch(() => ({ data: [] }))])
      .then(([p, d]) => { setItems(p.data || []); setDevs(d.data || []); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ ...EMPTY }); setError(''); };
  const openEdit = (p: any) => { setEditing(p); const f: Record<string, unknown> = { ...EMPTY }; Object.keys(EMPTY).forEach((k) => { if (p[k] !== undefined && p[k] !== null) f[k] = p[k]; }); setForm(f); setError(''); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError('Name required.'); return; }
    setSaving(true);
    setError('');
    try {
      const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));
      const payload: Record<string, unknown> = { ...form, price_min: num(form.price_min), price_max: num(form.price_max), total_units: num(form.total_units), tower_count: num(form.tower_count), developer_id: form.developer_id === '' ? null : form.developer_id };
      if (editing?.isNew) await apiMut('/api/projects', 'POST', payload);
      else await apiMut('/api/projects', 'PUT', { ...payload, id: editing.id });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const ok = await showConfirm('Delete this project? Linked listings will be unlinked.', 'Delete Project');
    if (!ok) return;
    await apiMut('/api/projects', 'DELETE', { id });
    load();
  };

  const val = (v: unknown) => (v === null || v === undefined ? '' : String(v));
  const localities = form.city ? CITY_AREAS[val(form.city)] || [] : [];
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const pagedItems = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <SEO title="Manage Projects" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS</div>
          <h1 className="font-serif text-ink text-3xl">Projects <span className="text-lg text-ink/40">({items.length})</span></h1>
        </div>
        <button onClick={openNew} className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}><Plus size={15} /> Add Project</button>
      </div>

      <Card>
        <CardHead title="All projects" sub="New launches, RERA status & pricing" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.15em] uppercase text-ink/45 border-b border-ink/10">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-3 py-3 font-medium">Developer</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Range</th>
                  <th className="px-3 py-3 font-medium">RERA</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {pagedItems.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.cover_image || '/images/tower-b.jpg'} alt="" className="w-14 h-11 object-cover" />
                        <div><div className="font-medium">{p.name}</div><div className="text-xs text-ink/45">{p.status} · {p.configurations}</div></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink/70">{p.developers?.name || '—'}</td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{p.locality}, {p.city}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{formatINR(p.price_min)} – {formatINR(p.price_max)}</td>
                    <td className="px-3 py-3"><StatusPill status={p.rera_status || 'Applied'} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => openEdit(p)} className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark"><Pencil size={14} /></button>
                        {isAdmin && <button onClick={() => remove(p.id)} className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      {editing && (
        <div className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#f4f1ea] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-ink sticky top-0">
              <h3 className="font-serif text-white text-lg">{editing.isNew ? 'Add Project' : 'Edit Project'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/60 hover:text-gold"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className={labelCls}>Name *</label><input value={val(form.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea value={val(form.description)} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} /></div>
                <div><label className={labelCls}>City</label><select value={val(form.city) || 'Navi Mumbai'} onChange={(e) => setForm({ ...form, city: e.target.value, locality: '' })} className={inputCls}>{Object.keys(CITY_AREAS).map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={labelCls}>Locality</label><select value={val(form.locality)} onChange={(e) => setForm({ ...form, locality: e.target.value })} className={inputCls}><option value="">Select…</option>{localities.map((l) => <option key={l}>{l}</option>)}</select></div>
                <div><label className={labelCls}>Developer</label><select value={val(form.developer_id)} onChange={(e) => setForm({ ...form, developer_id: e.target.value })} className={inputCls}><option value="">None</option>{devs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                <div><label className={labelCls}>Status</label><select value={val(form.status) || 'New Launch'} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>{['New Launch', 'Under Construction', 'Ready to Move', 'Completed'].map((s) => <option key={s}>{s}</option>)}</select></div>
                <div><label className={labelCls}>Configurations</label><input value={val(form.configurations)} onChange={(e) => setForm({ ...form, configurations: e.target.value })} className={inputCls} placeholder="2, 3 BHK" /></div>
                <div><label className={labelCls}>Possession</label><input value={val(form.possession_date)} onChange={(e) => setForm({ ...form, possession_date: e.target.value })} className={inputCls} placeholder="Dec 2028" /></div>
                <div><label className={labelCls}>Price min (₹)</label><input type="number" value={val(form.price_min)} onChange={(e) => setForm({ ...form, price_min: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Price max (₹)</label><input type="number" value={val(form.price_max)} onChange={(e) => setForm({ ...form, price_max: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Total units</label><input type="number" value={val(form.total_units)} onChange={(e) => setForm({ ...form, total_units: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Towers</label><input type="number" value={val(form.tower_count)} onChange={(e) => setForm({ ...form, tower_count: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>RERA number</label><input value={val(form.rera_number)} onChange={(e) => setForm({ ...form, rera_number: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>RERA status</label><select value={val(form.rera_status) || 'Applied'} onChange={(e) => setForm({ ...form, rera_status: e.target.value })} className={inputCls}>{['Applied', 'Approved', 'Expired', 'Not Applicable'].map((s) => <option key={s}>{s}</option>)}</select></div>
                <div className="sm:col-span-2"><label className={labelCls}>Cover image URL</label><input value={val(form.cover_image)} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Amenities (text)</label><textarea value={val(form.amenities_text)} onChange={(e) => setForm({ ...form, amenities_text: e.target.value })} rows={2} className={inputCls} /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#b98a2f] w-4 h-4" /> Featured on homepage</label>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Project'}</button>
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReraBadge({ status }: { status: string }) {
  return <span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> <StatusPill status={status} /></span>;
}
