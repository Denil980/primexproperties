import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut } from '../lib/api';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost } from './ui';

const EMPTY = { slug: '', title: '', meta_description: '', keywords: '', h1: '', body: '' };

export default function AdminSeo() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    apiGet('/api/seo').then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ ...EMPTY }); setError(''); };
  const openEdit = (p: any) => { setEditing(p); const f: Record<string, unknown> = { ...EMPTY }; Object.keys(EMPTY).forEach((k) => { if (p[k] !== undefined && p[k] !== null) f[k] = p[k]; }); setForm(f); setError(''); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title) { setError('Slug and title required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing?.isNew) await apiMut('/api/seo', 'POST', form);
      else await apiMut('/api/seo', 'PUT', { ...form, id: editing.id });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this SEO entry?')) return;
    await apiMut('/api/seo', 'DELETE', { id });
    load();
  };

  return (
    <div className="space-y-5">
      <SEO title="SEO Manager" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Growth</div>
          <h1 className="font-serif text-ink text-3xl">SEO Manager</h1>
        </div>
        <button onClick={openNew} className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}><Plus size={15} /> Add Entry</button>
      </div>
      <Card>
        <CardHead title="Page meta registry" sub="Titles, descriptions & keyword targets per route" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="divide-y divide-ink/5">
            {items.map((s) => (
              <div key={s.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-gold-dark bg-gold/10 inline-block px-2 py-0.5">/{s.slug}</div>
                    <div className="font-medium text-ink mt-1.5">{s.title} <span className="text-xs text-ink/40">({String(s.title || '').length} ch)</span></div>
                    <div className="text-sm text-ink/55 mt-1 line-clamp-2">{s.meta_description} <span className="text-xs text-ink/35">({String(s.meta_description || '').length} ch)</span></div>
                    {s.keywords && <div className="text-xs text-ink/45 mt-1.5">Keywords: {s.keywords}</div>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark"><Pencil size={14} /></button>
                    <button onClick={() => remove(s.id)} className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <div className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#f4f1ea] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-ink sticky top-0">
              <h3 className="font-serif text-white text-lg">{editing.isNew ? 'Add SEO Entry' : 'Edit SEO Entry'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/60 hover:text-gold"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Route slug * (e.g. properties)</label><input value={String(form.slug)} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>H1</label><input value={String(form.h1)} onChange={(e) => setForm({ ...form, h1: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Meta title * (50–60 chars ideal)</label><input value={String(form.title)} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /><div className="text-xs text-ink/40 mt-1">{String(form.title || '').length} characters</div></div>
              <div><label className={labelCls}>Meta description (150–160 chars ideal)</label><textarea value={String(form.meta_description)} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={3} className={inputCls} /><div className="text-xs text-ink/40 mt-1">{String(form.meta_description || '').length} characters</div></div>
              <div><label className={labelCls}>Keywords (comma separated)</label><input value={String(form.keywords)} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>SEO body copy (optional)</label><textarea value={String(form.body)} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className={inputCls} /></div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Entry'}</button>
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
