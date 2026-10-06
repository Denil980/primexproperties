import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { LOCALITIES, type Locality } from '../data/localities';
import { apiGet } from '../lib/api';

export default function Localities() {
  const [list, setList] = useState<Locality[]>(LOCALITIES);

  useEffect(() => {
    apiGet<{ data: Locality[] }>('/api/localities')
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Locality Guides — Kharghar, Belapur, Vashi, Nerul, Thane & Powai" description="Data-rich locality guides: best properties in Kharghar, Belapur & Vashi, plus Nerul, Thane West & Powai. Prices, connectivity, schools & investment outlook." keywords="best properties in Kharghar, best properties in Belapur, best properties in Vashi, Thane West flats, Powai luxury homes" />
      <div className="bg-ink pt-32 lg:pt-40 pb-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Neighbourhood intelligence</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Locality Guides</h1>
          <p className="text-white/60 mt-3 max-w-2xl font-light">Prices, connectivity, schools and investment outlook — researched by advisors who live these markets.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((l, i) => (
          <motion.div key={l.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}>
            <Link to={`/localities/${l.slug}`} className="group relative block h-[440px] overflow-hidden">
              <img src={l.image} alt={l.tagline} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-[1.2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-ink/70 backdrop-blur text-white text-[10px] tracking-[0.25em] uppercase px-3 py-1.5"><MapPin size={11} className="text-gold" /> {l.city}</div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="text-gold text-[10px] tracking-[0.3em] uppercase">{l.avgPrice}</div>
                <h3 className="font-serif text-white text-3xl mt-1">{l.name}</h3>
                <p className="text-white/65 text-sm mt-1.5 font-light line-clamp-2">{l.tagline}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-white/80 text-xs">{l.priceRange}</span>
                  <span className="inline-flex items-center gap-1.5 text-white text-xs tracking-[0.2em] uppercase border-b border-gold pb-1 group-hover:gap-3 transition-all">Guide <ArrowUpRight size={14} /></span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
