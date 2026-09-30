import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, timeAgo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost } from './ui';

const EMPTY = { title: '', slug: '', excerpt: '', content: '', category: 'Market Trends', cover_image: '', author: 'Primex Research', tags: '', published: false };
const CATS = ['Market Trends', 'Guides', 'Investment', 'RERA & Legal', 'Lifestyle'];

export default function AdminBlog() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    apiGet('/api/blog?limit=100').then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ ...EMPTY }); setError(''); };
  const openEdit = (p: any) => { setEditing(p); const f: Record<string, unknown> = { ...EMPTY }; Object.keys(EMPTY).forEach((k) => { if (p[k] !== undefined && p[k] !== null) f[k] = p[k]; }); setForm(f); setError(''); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { setError('Title required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing?.isNew) await apiMut('/api/blog', 'POST', form);
      else await apiMut('/api/blog', 'PUT', { ...form, id: editing.id });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    await apiMut('/api/blog', 'DELETE', { id });
    load();
  };

  return (
    <div className="space-y-5">
      <SEO title="Blog CMS" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS</div>
          <h1 className="font-serif text-ink text-3xl">Blog <span className="text-lg text-ink/40">({items.length})</span></h1>
        </div>
        <button onClick={openNew} className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}><Plus size={15} /> New Post</button>
      </div>
      <Card>
        <CardHead title="All posts" sub="Drafts stay hidden until published" />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="divide-y divide-ink/5">
            {items.map((b) => (
              <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
                <img src={b.cover_image || '/images/living-a.jpg'} alt="" className="w-20 h-14 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink truncate">{b.title}</div>
                  <div className="text-xs text-ink/45 mt-0.5">{b.category} · {timeAgo(b.created_at)}</div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 border shrink-0 ${b.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink/5 text-ink/50 border-ink/10'}`}>{b.published ? 'Published' : 'Draft'}</span>
                <button onClick={() => openEdit(b)} className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark shrink-0"><Pencil size={14} /></button>
                {isAdmin && <button onClick={() => remove(b.id)} className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500 shrink-0"><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <div className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#f4f1ea] w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-ink sticky top-0">
              <h3 className="font-serif text-white text-lg">{editing.isNew ? 'New Post' : 'Edit Post'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/60 hover:text-gold"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div><label className={labelCls}>Title *</label><input value={String(form.title)} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={labelCls}>Category</label><select value={String(form.category)} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={labelCls}>Author</label><input value={String(form.author)} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Tags (comma)</label><input value={String(form.tags)} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Cover image URL</label><input value={String(form.cover_image)} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className={inputCls} placeholder="/images/living-a.jpg" /></div>
              <div><label className={labelCls}>Excerpt</label><textarea value={String(form.excerpt)} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={inputCls} /></div>
              <div><label className={labelCls}>Content</label><textarea value={String(form.content)} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className={inputCls} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[#b98a2f] w-4 h-4" /> Published</label>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Post'}</button>
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
