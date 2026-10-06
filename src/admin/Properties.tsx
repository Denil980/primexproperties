import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pencil, Trash2, Plus, Search, Eye, EyeOff, Star } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Card, CardHead, Empty, inputCls, btnPrimary, btnGhost, StatusPill, Pagination } from './ui';

export default function AdminProperties() {
  const { isAdmin } = useAuth();
  const { showConfirm } = useModal();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kw, setKw] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '7', page: String(page), is_active: 'all', sort: 'newest' });
    if (search) q.set('search', search);
    apiGet(`/api/properties?${q.toString()}`).then((r) => { setItems(r.data || []); setTotal(r.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, [search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async (p: any) => {
    await apiMut('/api/properties', 'PUT', { id: p.id, is_active: !p.is_active });
    load();
  };

  const toggleFeatured = async (p: any) => {
    await apiMut('/api/properties', 'PUT', { id: p.id, featured: !p.featured });
    load();
  };

  const remove = async (id: number) => {
    const ok = await showConfirm('Delete this listing permanently?', 'Delete Property');
    if (!ok) return;
    await apiMut('/api/properties', 'DELETE', { id });
    load();
  };

  const pages = Math.max(1, Math.ceil(total / 7));

  return (
    <div className="space-y-5">
      <SEO title="Manage Properties" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS · Inventory</div>
          <h1 className="font-serif text-ink text-3xl">Properties <span className="text-lg text-ink/40">({total})</span></h1>
        </div>
        <Link to="/admin/properties/new" className={btnPrimary + ' inline-flex items-center gap-2 !py-3'}><Plus size={15} /> Add Listing</Link>
      </div>

      <Card>
        <CardHead title="All listings" sub="Search, publish, feature or delete" action={
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && { search: setSearch(kw.trim()), page: setPage(1) }} placeholder="Search title, locality…" className={inputCls + ' !pl-9 !w-56'} />
            </div>
            <button onClick={() => { setSearch(kw.trim()); setPage(1); }} className={btnGhost}>Go</button>
          </div>
        } />
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div> : items.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.15em] uppercase text-ink/45 border-b border-ink/10">
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Config</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Views</th>
                  <th className="px-3 py-3 font-medium">Flags</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.cover_image || '/images/tower-a.jpg'} alt="" className="w-14 h-11 object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-ink truncate max-w-[260px]">{p.title}</div>
                          <div className="text-xs text-ink/45">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{p.locality}, {p.city}</td>
                    <td className="px-3 py-3 font-medium whitespace-nowrap">{formatINR(p.price)}</td>
                    <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{p.bedrooms} BHK · {p.area_sqft} sqft</td>
                    <td className="px-3 py-3"><StatusPill status={p.is_active ? 'Approved' : 'Pending'} /><span className="text-xs text-ink/50 ml-1">{p.is_active ? 'Live' : 'Hidden'}</span></td>
                    <td className="px-3 py-3 text-ink/70">{p.views || 0}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => toggleFeatured(p)} title="Featured" className={`p-1.5 border transition ${p.featured ? 'bg-gold border-gold text-ink' : 'border-ink/15 text-ink/40 hover:border-gold'}`}><Star size={13} fill={p.featured ? 'currentColor' : 'none'} /></button>
                        <button onClick={() => toggleActive(p)} title={p.is_active ? 'Unpublish' : 'Publish'} className="p-1.5 border border-ink/15 text-ink/60 hover:border-gold transition">{p.is_active ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <Link to={`/admin/properties/${p.id}`} className="p-2 border border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark transition"><Pencil size={14} /></Link>
                        {isAdmin && <button onClick={() => remove(p.id)} className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500 transition"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPageChange={(p) => setPage(p)} />
      </Card>
    </div>
  );
}
