import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost } from './ui';

const EMPTY = { name: '', slug: '', description: '', hq: 'Mumbai', founded_year: '', projects_delivered: '', ongoing_projects: '', rating: '', featured: false };

export default function AdminDevelopers() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    apiGet('/api/developers?limit=100').then((r) => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false));
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
      const payload: Record<string, unknown> = { ...form, founded_year: num(form.founded_year), projects_delivered: num(form.projects_delivered), ongoing_projects: num(form.ongoing_projects), rating: form.rating === '' ? null : Number(form.rating) };
      if (editing?.isNew) await apiMut('/api/developers', 'POST', payload);
      else await apiMut('/api/developers', 'PUT', { ...payload, id: editing.id });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this developer?')) return;
    await apiMut('/api/developers', 'DELETE', { id });
    load();
  };

  return (
    <div className="space-y-5">
      <SEO title="Manage Developers" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS</div>
          <h1 className="font-serif text-ink text-3xl">Developers <span className="text-lg text-ink/40">({items.length})</span></h1>
        </div>
        <button onClick={openNew} className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}><Plus size={15} /> Add Developer</button>
      </div>
      <Card>
        <CardHead title="Partner developers" sub="Profiles, track records & ratings" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {items.map((d) => (
              <div key={d.id} className="border border-ink/10 p-5 hover:border-gold/50 transition">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-ink text-gold flex items-center justify-center font-serif text-xl">{d.name?.[0]}</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(d)} className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark"><Pencil size={14} /></button>
                    {isAdmin && <button onClick={() => remove(d.id)} className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500"><Trash2 size={14} /></button>}
                  </div>
                </div>
                <h3 className="font-serif text-xl text-ink mt-3">{d.name}</h3>
                <div className="text-xs text-ink/50 mt-0.5">{d.hq}{d.founded_year ? ` · Est. ${d.founded_year}` : ''}{d.rating ? ` · ★ ${d.rating}` : ''}</div>
                <p className="text-sm text-ink/55 mt-2 line-clamp-2 font-light">{d.description}</p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-ink/10 text-sm text-ink/70">
                  <span><strong className="font-serif">{d.projects_delivered ?? '—'}</strong> delivered</span>
                  <span><strong className="font-serif">{d.ongoing_projects ?? '—'}</strong> ongoing</span>
                  {d.featured && <span className="text-gold-dark text-xs uppercase tracking-widest">★ Featured</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <div className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#f4f1ea] w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-ink sticky top-0">
              <h3 className="font-serif text-white text-lg">{editing.isNew ? 'Add Developer' : 'Edit Developer'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/60 hover:text-gold"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className={labelCls}>Name *</label><input value={String(form.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea value={String(form.description)} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} /></div>
                <div><label className={labelCls}>HQ</label><input value={String(form.hq)} onChange={(e) => setForm({ ...form, hq: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Founded year</label><input type="number" value={String(form.founded_year)} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Projects delivered</label><input type="number" value={String(form.projects_delivered)} onChange={(e) => setForm({ ...form, projects_delivered: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Ongoing projects</label><input type="number" value={String(form.ongoing_projects)} onChange={(e) => setForm({ ...form, ongoing_projects: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Rating (0–5)</label><input type="number" step="0.1" min={0} max={5} value={String(form.rating)} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inputCls} /></div>
                <label className="flex items-center gap-2 text-sm self-end pb-2.5"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#b98a2f] w-4 h-4" /> Featured</label>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Developer'}</button>
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
