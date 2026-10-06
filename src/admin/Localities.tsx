import { useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2, Plus, X, Upload, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { apiGet, apiMut, CITY_AREAS } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Card, CardHead, Empty, inputCls, labelCls, btnPrimary, btnGhost, Pagination } from './ui';

const STOCK = [
  '/images/tower-a.jpg',
  '/images/tower-b.jpg',
  '/images/tower-c.jpg',
  '/images/hero-skyline.jpg',
  '/images/thane-lake.jpg',
  '/images/living-a.jpg',
];

const EMPTY = {
  name: '',
  slug: '',
  city: 'Navi Mumbai',
  tagline: '',
  image: '/images/tower-a.jpg',
  avgPrice: '',
  priceRange: '',
  rentalYield: '',
  connectivity_text: '',
  highlights_text: '',
  intro_text: '',
};

export default function AdminLocalities() {
  const { isAdmin } = useAuth();
  const { showConfirm } = useModal();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showStock, setShowStock] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    apiGet('/api/localities')
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({ isNew: true });
    setForm({ ...EMPTY });
    setError('');
  };

  const openEdit = (l: any) => {
    setEditing(l);
    setForm({
      name: l.name || '',
      slug: l.slug || '',
      city: l.city || 'Navi Mumbai',
      tagline: l.tagline || '',
      image: l.image || '/images/tower-a.jpg',
      avgPrice: l.avgPrice || l.avg_price || '',
      priceRange: l.priceRange || l.price_range || '',
      rentalYield: l.rentalYield || l.rental_yield || '',
      connectivity_text: Array.isArray(l.connectivity) ? l.connectivity.join('\n') : '',
      highlights_text: Array.isArray(l.highlights) ? l.highlights.join('\n') : '',
      intro_text: Array.isArray(l.intro) ? l.intro.join('\n\n') : (l.intro || ''),
    });
    setError('');
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const base64 = await fileToBase64(file);
      const r = await apiMut('/api/upload', 'POST', {
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type,
        folder: 'localities',
      });
      setForm((f) => ({ ...f, image: r.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setError('Locality name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug || undefined,
        city: form.city || 'Navi Mumbai',
        tagline: form.tagline || '',
        image: form.image || '/images/tower-a.jpg',
        avgPrice: form.avgPrice || '',
        priceRange: form.priceRange || '',
        rentalYield: form.rentalYield || '',
        connectivity: String(form.connectivity_text || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        highlights: String(form.highlights_text || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        intro: String(form.intro_text || '')
          .split('\n\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editing?.isNew) {
        await apiMut('/api/localities', 'POST', payload);
      } else {
        await apiMut('/api/localities', 'PUT', { ...payload, id: editing.id });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const ok = await showConfirm('Delete this locality guide permanently?', 'Delete Locality');
    if (!ok) return;
    await apiMut('/api/localities', 'DELETE', { id });
    load();
  };

  const val = (v: unknown) => (v === null || v === undefined ? '' : String(v));
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const pagedItems = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <SEO title="Manage Localities" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS · Intelligence</div>
          <h1 className="font-serif text-ink text-3xl">
            Localities <span className="text-lg text-ink/40">({items.length})</span>
          </h1>
        </div>
        <button onClick={openNew} className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}>
          <Plus size={15} /> Add Locality
        </button>
      </div>

      <Card>
        <CardHead title="Neighbourhood guides" sub="Data, connectivity, pricing & live public content" />
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gold-dark" size={28} />
          </div>
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.15em] uppercase text-ink/45 border-b border-ink/10">
                  <th className="px-5 py-3 font-medium">Locality</th>
                  <th className="px-3 py-3 font-medium">City</th>
                  <th className="px-3 py-3 font-medium">Avg Price</th>
                  <th className="px-3 py-3 font-medium">Range</th>
                  <th className="px-3 py-3 font-medium">Yield</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {pagedItems.map((l) => (
                  <tr key={l.id || l.slug} className="hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.image || '/images/tower-a.jpg'}
                          alt=""
                          className="w-14 h-11 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-ink flex items-center gap-1.5">
                            {l.name}
                            <Link
                              to={`/localities/${l.slug}`}
                              target="_blank"
                              title="View guide on website"
                              className="text-ink/40 hover:text-gold transition"
                            >
                              <ExternalLink size={13} />
                            </Link>
                          </div>
                          <div className="text-xs text-ink/45 truncate max-w-[280px]">{l.tagline}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-gold-dark" /> {l.city}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-ink whitespace-nowrap">{l.avgPrice || l.avg_price || '—'}</td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{l.priceRange || l.price_range || '—'}</td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{l.rentalYield || l.rental_yield || '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => openEdit(l)}
                          className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark transition"
                        >
                          <Pencil size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => remove(l.id)}
                            className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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

      {/* Edit / Add Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#f4f1ea] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-ink/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-ink sticky top-0 z-10 border-b border-gold/30">
              <div>
                <div className="text-gold text-[10px] tracking-[0.3em] uppercase">CMS · Neighbourhood Guide</div>
                <h3 className="font-serif text-white text-xl mt-0.5">
                  {editing.isNew ? 'Add Locality' : `Edit ${form.name || 'Locality'}`}
                </h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-white/60 hover:text-gold p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Locality Name *</label>
                  <input
                    value={val(form.name)}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Kharghar, Belapur, Vashi, Thane West"
                  />
                </div>
                <div>
                  <label className={labelCls}>URL Slug (auto if blank)</label>
                  <input
                    value={val(form.slug)}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. kharghar"
                  />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <select
                    value={val(form.city) || 'Navi Mumbai'}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputCls}
                  >
                    {Object.keys(CITY_AREAS).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Tagline (Displays under name)</label>
                  <input
                    value={val(form.tagline)}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Best properties in Kharghar — Navi Mumbai's greenest node"
                  />
                </div>
                <div>
                  <label className={labelCls}>Average Price (₹/sq.ft)</label>
                  <input
                    value={val(form.avgPrice)}
                    onChange={(e) => setForm({ ...form, avgPrice: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. ₹11,200 / sq.ft"
                  />
                </div>
                <div>
                  <label className={labelCls}>Price Range</label>
                  <input
                    value={val(form.priceRange)}
                    onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. ₹75 L – ₹2.4 Cr"
                  />
                </div>
                <div>
                  <label className={labelCls}>Rental Yield</label>
                  <input
                    value={val(form.rentalYield)}
                    onChange={(e) => setForm({ ...form, rentalYield: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 3.6 – 4.1%"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Cover Image URL</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={val(form.image)}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className={inputCls}
                      placeholder="Paste image URL..."
                    />
                    <div className="flex gap-2">
                      <label className={`${btnGhost} cursor-pointer inline-flex items-center gap-2 shrink-0`}>
                        <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadImage(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStock(!showStock)}
                        className={btnGhost + ' shrink-0'}
                      >
                        Stock
                      </button>
                    </div>
                  </div>
                  {showStock && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                      {STOCK.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => {
                            setForm({ ...form, image: s });
                            setShowStock(false);
                          }}
                          className={`border-2 overflow-hidden ${form.image === s ? 'border-gold' : 'border-transparent'}`}
                        >
                          <img src={s} alt="" className="w-full h-14 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Locality Overview / Intro (Separate paragraphs with blank lines)</label>
                  <textarea
                    value={val(form.intro_text)}
                    onChange={(e) => setForm({ ...form, intro_text: e.target.value })}
                    rows={4}
                    className={inputCls}
                    placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Key Highlights (One item per line)</label>
                  <textarea
                    value={val(form.highlights_text)}
                    onChange={(e) => setForm({ ...form, highlights_text: e.target.value })}
                    rows={3}
                    className={inputCls}
                    placeholder="Central Park & Golf Course greens&#10;Top schools: Ryan, Vibgyor, DY Patil&#10;CIDCO planned sectors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Connectivity & Transport (One item per line)</label>
                  <textarea
                    value={val(form.connectivity_text)}
                    onChange={(e) => setForm({ ...form, connectivity_text: e.target.value })}
                    rows={3}
                    className={inputCls}
                    placeholder="Kharghar & Mansarovar railway stations&#10;Sion–Panvel Expressway access&#10;Upcoming Airport (20 min)"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button disabled={saving} className={btnPrimary}>
                  {saving ? 'Saving...' : 'Save Locality Guide'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
