import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, formatINR } from '../lib/api';

export default function Favorites() {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/favorites').then(setFavs).catch(() => setFavs([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Saved Homes" />
      <div className="bg-ink pt-32 lg:pt-36 pb-10 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Your shortlist</div>
          <h1 className="font-serif text-white text-3xl lg:text-4xl mt-2">Saved Homes</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={30} /></div> :
          favs.length === 0 ? (
            <div className="bg-white border border-ink/10 p-14 text-center">
              <Heart size={40} className="mx-auto text-ink/20" />
              <div className="font-serif text-2xl text-ink mt-4">Nothing saved yet</div>
              <Link to="/properties" className="inline-flex items-center gap-2 mt-6 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">Browse homes <ArrowRight size={15} /></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favs.map((f) => {
                const p = f.properties;
                if (!p) return null;
                return (
                  <Link key={f.id} to={`/properties/${p.slug}`} className="bg-white border border-ink/10 hover:border-gold/50 transition overflow-hidden group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={p.cover_image || '/images/tower-a.jpg'} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute bottom-3 left-3 font-serif text-white text-xl bg-ink/70 px-3 py-1">{formatINR(p.price)}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-ink line-clamp-1">{p.title}</h3>
                      <div className="text-ink/50 text-sm">{p.locality}, {p.city} · {p.bedrooms} BHK · {p.area_sqft} sq.ft</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
