import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Search, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, formatINR } from '../lib/api';

export default function Projects() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [kw, setKw] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (city) q.set('city', city);
    if (search) q.set('search', search);
    q.set('limit', '50');
    apiGet(`/api/projects?${q.toString()}`).then((r) => setItems(r.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, [city, search]);

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="New Projects & Pre-Launches in Mumbai, Navi Mumbai & Thane" description="Explore signature new-launch projects across Kharghar, Belapur, Vashi, Nerul & Thane West. MahaRERA-approved towers with launch pricing from top MMR developers." keywords="new projects Kharghar, pre launch Belapur, new launch Vashi, upcoming projects Thane West, MahaRERA projects Navi Mumbai" />
      <div className="bg-ink pt-32 lg:pt-40 pb-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">New launches & pre-launches</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Signature Projects</h1>
          <p className="text-white/60 mt-3 max-w-2xl font-light">Launch-stage pricing, preferred allotments and payment plans — curated from MMR's most trusted developers.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="flex gap-2">
              {['', 'Mumbai', 'Navi Mumbai', 'Thane'].map((c) => (
                <button key={c} onClick={() => setCity(c)} className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase border transition ${city === c ? 'bg-gold text-ink border-gold font-semibold' : 'border-white/20 text-white/70 hover:border-gold'}`}>{c || 'All'}</button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearch(kw.trim())} placeholder="Search projects…" className="w-full bg-white/10 border border-white/15 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-gold" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-dark" size={32} /></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-ink/10 p-14 text-center font-serif text-xl text-ink">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((pr, i) => (
              <motion.div key={pr.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}>
                <Link to={`/projects/${pr.slug}`} className="group block bg-white border border-ink/10 hover:border-gold/60 hover:shadow-xl transition overflow-hidden h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={pr.cover_image || '/images/tower-b.jpg'} alt={pr.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-ink/85 text-white text-[10px] tracking-[0.18em] uppercase px-2.5 py-1">{pr.status}</span>
                      {pr.rera_status === 'Approved' && <span className="bg-emerald-600 text-white text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 flex items-center gap-1"><ShieldCheck size={10} /> RERA</span>}
                    </div>
                    <div className="absolute bottom-3 left-4 font-serif text-white text-xl">{formatINR(pr.price_min)} – {formatINR(pr.price_max)}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{pr.locality}, {pr.city}</div>
                    <h3 className="font-serif text-ink text-2xl mt-1 group-hover:text-gold-dark transition">{pr.name}</h3>
                    <div className="text-ink/50 text-sm mt-1">{pr.developers?.name}{pr.total_units ? ` · ${pr.total_units} units` : ''}{pr.configurations ? ` · ${pr.configurations}` : ''}</div>
                    <span className="inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase text-ink mt-4 group-hover:text-gold-dark group-hover:gap-3 transition-all">View project <ArrowRight size={14} /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
