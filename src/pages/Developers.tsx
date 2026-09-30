import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Loader2, Building2 } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet } from '../lib/api';

export default function Developers() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/developers?limit=50').then((r) => setItems(r.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Top Real Estate Developers in Mumbai, Navi Mumbai & Thane" description="Meet MMR's most trusted developers — track records, delivered projects, RERA history & Primex-partnered inventory across Mumbai, Navi Mumbai & Thane." />
      <div className="bg-ink pt-32 lg:pt-40 pb-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Partner network</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Trusted Developers</h1>
          <p className="text-white/60 mt-3 max-w-2xl font-light">We work only with developers who deliver on time, honour RERA commitments and build homes we're proud to sell.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-dark" size={32} /></div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}>
                <Link to={`/developers/${d.slug}`} className="group block bg-white border border-ink/10 hover:border-gold/60 hover:shadow-xl transition p-7 h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-ink text-gold flex items-center justify-center font-serif text-2xl">{d.name?.[0]}</div>
                    {d.rating && <span className="flex items-center gap-1 text-sm text-ink/70"><Star size={14} className="text-gold-dark" fill="currentColor" /> {d.rating}</span>}
                  </div>
                  <h3 className="font-serif text-ink text-2xl mt-4 group-hover:text-gold-dark transition">{d.name}</h3>
                  <div className="text-ink/50 text-xs tracking-[0.2em] uppercase mt-1 flex items-center gap-1.5"><Building2 size={12} /> {d.hq || 'Mumbai'} {d.founded_year ? `· Est. ${d.founded_year}` : ''}</div>
                  <p className="text-ink/55 text-sm mt-3 line-clamp-3 font-light leading-relaxed">{d.description}</p>
                  {(d.projects_delivered || d.ongoing_projects) && (
                    <div className="flex gap-5 mt-4 pt-4 border-t border-ink/10 text-sm">
                      {d.projects_delivered ? <span className="text-ink/70"><strong className="text-ink font-serif text-lg">{d.projects_delivered}</strong> delivered</span> : null}
                      {d.ongoing_projects ? <span className="text-ink/70"><strong className="text-ink font-serif text-lg">{d.ongoing_projects}</strong> ongoing</span> : null}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase text-ink mt-4 group-hover:text-gold-dark group-hover:gap-3 transition-all">View profile <ArrowRight size={14} /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
