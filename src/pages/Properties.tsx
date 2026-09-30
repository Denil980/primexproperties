import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ShieldCheck, RotateCcw } from 'lucide-react';
import SEO from '../components/SEO';
import PropertyCard, { PropertyCardSkeleton, type CardProperty } from '../components/PropertyCard';
import { apiGet, CITY_AREAS, PROPERTY_TYPES, STATUSES } from '../lib/api';

const SORTS = [
  { v: 'newest', l: 'Newest first' },
  { v: 'price_asc', l: 'Price: Low to High' },
  { v: 'price_desc', l: 'Price: High to Low' },
  { v: 'area_desc', l: 'Area: Largest' },
  { v: 'popular', l: 'Most viewed' },
];

const BHKS = [1, 2, 3, 4, 5];

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<CardProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const f = useMemo(() => ({
    search: params.get('search') || '',
    city: params.get('city') || '',
    locality: params.get('locality') || '',
    bedrooms: params.get('bedrooms') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    min_area: params.get('min_area') || '',
    max_area: params.get('max_area') || '',
    property_type: params.get('property_type') || '',
    status: params.get('status') || '',
    listing_type: params.get('listing_type') || '',
    rera: params.get('rera') || '',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page') || '1'),
  }), [params]);

  const set = useCallback((patch: Record<string, string>, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => { if (!v) next.delete(k); else next.set(k, v); });
    if (resetPage) next.delete('page');
    setParams(next, { replace: false });
  }, [params, setParams]);

  const [kw, setKw] = useState(f.search);
  useEffect(() => setKw(f.search), [f.search]);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    q.set('limit', '12');
    apiGet(`/api/properties?${q.toString()}`)
      .then((r) => { setItems(r.data || []); setTotal(r.total || 0); })
      .catch(() => { setItems([]); setTotal(0); })
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when the mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = showFilters ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showFilters]);

  const activeCount = [f.city, f.locality, f.bedrooms, f.min_price, f.max_price, f.min_area, f.property_type, f.status, f.listing_type, f.rera].filter(Boolean).length;
  const pages = Math.max(1, Math.ceil(total / 12));
  const localities = f.city ? CITY_AREAS[f.city] || [] : Object.values(CITY_AREAS).flat();

  const sel = 'appearance-none w-full bg-white border border-ink/15 text-ink text-base sm:text-sm px-3.5 py-3 sm:py-2.5 pr-8 focus:outline-none focus:border-gold cursor-pointer min-h-[48px] sm:min-h-0';
  const chip = (on: boolean) => `px-4 py-2.5 sm:px-3.5 sm:py-2 text-[13px] sm:text-xs tracking-wider border transition min-h-[44px] sm:min-h-0 ${on ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60 hover:border-gold'}`;

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">City</label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => set({ city: '', locality: '' })} className={chip(!f.city)}>All</button>
          {Object.keys(CITY_AREAS).map((c) => <button key={c} onClick={() => set({ city: c, locality: '' })} className={chip(f.city === c)}>{c}</button>)}
        </div>
      </div>
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Locality</label>
        <select value={f.locality} onChange={(e) => set({ locality: e.target.value })} className={`${sel} mt-2`}>
          <option value="">All localities</option>
          {localities.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Bedrooms</label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => set({ bedrooms: '' })} className={chip(!f.bedrooms)}>Any</button>
          {BHKS.map((b) => <button key={b} onClick={() => set({ bedrooms: String(b) })} className={chip(f.bedrooms === String(b))}>{b}{b === 5 ? '+' : ''} BHK</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Min price</label>
          <select value={f.min_price} onChange={(e) => set({ min_price: e.target.value })} className={`${sel} mt-2`}>
            <option value="">No min</option>
            <option value="5000000">₹50 L</option>
            <option value="7500000">₹75 L</option>
            <option value="10000000">₹1 Cr</option>
            <option value="15000000">₹1.5 Cr</option>
            <option value="25000000">₹2.5 Cr</option>
            <option value="50000000">₹5 Cr</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Max price</label>
          <select value={f.max_price} onChange={(e) => set({ max_price: e.target.value })} className={`${sel} mt-2`}>
            <option value="">No max</option>
            <option value="7500000">₹75 L</option>
            <option value="12000000">₹1.2 Cr</option>
            <option value="20000000">₹2 Cr</option>
            <option value="35000000">₹3.5 Cr</option>
            <option value="100000000">₹10 Cr</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Min area (sq.ft)</label>
          <input value={f.min_area} onChange={(e) => set({ min_area: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 650" className="w-full bg-white border border-ink/15 text-ink text-sm px-3.5 py-2.5 mt-2 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Max area</label>
          <input value={f.max_area} onChange={(e) => set({ max_area: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 2000" className="w-full bg-white border border-ink/15 text-ink text-sm px-3.5 py-2.5 mt-2 focus:outline-none focus:border-gold" />
        </div>
      </div>
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Property type</label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => set({ property_type: '' })} className={chip(!f.property_type)}>All</button>
          {PROPERTY_TYPES.map((t) => <button key={t} onClick={() => set({ property_type: t })} className={chip(f.property_type === t)}>{t}</button>)}
        </div>
      </div>
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Construction status</label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => set({ status: '' })} className={chip(!f.status)}>All</button>
          {STATUSES.map((t) => <button key={t} onClick={() => set({ status: t })} className={chip(f.status === t)}>{t}</button>)}
        </div>
      </div>
      <div>
        <label className="text-[11px] tracking-[0.25em] uppercase text-ink/50">Listing</label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={() => set({ listing_type: '' })} className={chip(!f.listing_type)}>Buy + Rent</button>
          <button onClick={() => set({ listing_type: 'Sale' })} className={chip(f.listing_type === 'Sale')}>Buy</button>
          <button onClick={() => set({ listing_type: 'Rent' })} className={chip(f.listing_type === 'Rent')}>Rent</button>
        </div>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
        <input type="checkbox" checked={f.rera === 'true'} onChange={(e) => set({ rera: e.target.checked ? 'true' : '' })} className="accent-emerald-700 w-4 h-4" />
        <ShieldCheck size={15} className="text-emerald-700" />
        <span className="text-sm text-emerald-900">MahaRERA approved only</span>
      </label>
      {activeCount > 0 && (
        <button onClick={() => setParams({}, { replace: true })} className="w-full flex items-center justify-center gap-2 border border-ink/15 py-2.5 text-xs tracking-[0.2em] uppercase text-ink/60 hover:border-red-400 hover:text-red-500 transition">
          <RotateCcw size={13} /> Clear all ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Properties for Sale & Rent in Mumbai, Navi Mumbai & Thane" description="Browse 50+ premium properties — the best properties in Kharghar, Belapur, Vashi, Nerul & Thane West. Filter by budget, BHK, RERA status & more. Flats, villas & penthouses across MMR." keywords="best properties in Kharghar, best properties in Belapur, best properties in Vashi, flats for sale Navi Mumbai, luxury apartments Thane" />
      <div className="bg-ink pt-32 lg:pt-40 pb-10 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">The collection</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Properties across MMR</h1>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && set({ search: kw.trim() })} placeholder="Search by project, locality, tower…" className="w-full bg-white/10 border border-white/15 text-white pl-11 pr-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
            </div>
            <button onClick={() => set({ search: kw.trim() })} className="bg-gold text-ink px-8 py-3 text-sm font-semibold tracking-[0.18em] uppercase hover:bg-white transition min-h-[48px]">Search</button>
            <button onClick={() => setShowFilters(true)} className="lg:hidden border border-white/25 text-white px-6 py-3 min-h-[48px] text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2">
              <SlidersHorizontal size={15} /> Filters {activeCount > 0 && <span className="bg-gold text-ink text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 flex gap-8">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white border border-ink/10 p-5 sticky top-28">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-ink/10">
              <SlidersHorizontal size={16} className="text-gold-dark" />
              <span className="text-sm tracking-[0.2em] uppercase font-medium">Filters</span>
            </div>
            {filterPanel}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6">
            <p className="text-ink/60 text-sm">{loading ? 'Searching…' : <><strong className="text-ink">{total}</strong> {total === 1 ? 'home' : 'homes'} found</>}</p>
            <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="bg-white border border-ink/15 text-sm px-3 py-2 focus:outline-none focus:border-gold cursor-pointer">
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>

          {/* Mobile: sticky filter bar + bottom-sheet drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 bottom-0 top-[8%] bg-cream rounded-t-2xl flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-ink shrink-0">
                    <span className="text-white text-sm tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                      <SlidersHorizontal size={15} className="text-gold" /> Filters {activeCount > 0 && <span className="bg-gold text-ink text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeCount}</span>}
                    </span>
                    <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="text-white/60 hover:text-gold p-1"><X size={20} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
                  <div className="shrink-0 p-4 bg-white border-t border-ink/10 flex gap-2.5">
                    {activeCount > 0 && (
                      <button onClick={() => setParams({}, { replace: true })} className="px-5 py-3.5 border border-ink/20 text-ink/70 text-[13px] tracking-[0.15em] uppercase">Clear</button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="flex-1 bg-ink text-gold py-3.5 text-sm tracking-[0.18em] uppercase font-semibold">Show {total} homes</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile sticky filter button */}
          <div className="lg:hidden sticky top-[104px] z-30 -mx-5 px-5 py-2.5 bg-cream/95 backdrop-blur border-b border-ink/10 mb-5">
            <button onClick={() => setShowFilters(true)} className="w-full bg-ink text-white py-3 text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2">
              <SlidersHorizontal size={15} className="text-gold" /> Filters & Sort {activeCount > 0 && <span className="bg-gold text-ink text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeCount}</span>}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{[1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} />)}</div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-ink/10 p-14 text-center">
              <div className="font-serif text-2xl text-ink">No homes match your filters</div>
              <p className="text-ink/55 text-sm mt-2">Try widening your budget or clearing a filter — or tell us what you need.</p>
              <button onClick={() => setParams({}, { replace: true })} className="mt-6 border border-ink/20 px-6 py-2.5 text-sm tracking-[0.15em] uppercase hover:bg-ink hover:text-gold transition">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={f.page <= 1} onClick={() => set({ page: String(f.page - 1) }, false)} className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:border-gold disabled:opacity-30 transition"><ChevronLeft size={17} /></button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const pg = f.page <= 4 ? i + 1 : f.page + i - 3;
                    if (pg > pages || pg < 1) return null;
                    return <button key={pg} onClick={() => set({ page: String(pg) }, false)} className={`w-10 h-10 text-sm transition ${pg === f.page ? 'bg-ink text-gold' : 'border border-ink/15 hover:border-gold'}`}>{pg}</button>;
                  })}
                  <button disabled={f.page >= pages} onClick={() => set({ page: String(f.page + 1) }, false)} className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:border-gold disabled:opacity-30 transition"><ChevronRight size={17} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
