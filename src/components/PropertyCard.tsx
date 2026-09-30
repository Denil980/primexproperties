import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Bath, Ruler, MapPin, Heart, ShieldCheck, Star } from 'lucide-react';
import { formatINR } from '../lib/api';
import { useFavorites } from './FavoritesContext';

export interface CardProperty {
  id: number;
  title: string;
  slug: string;
  locality: string | null;
  city: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  property_type: string | null;
  status: string | null;
  cover_image: string | null;
  featured?: boolean;
  rera_approved?: boolean;
  projects?: { name?: string } | null;
  developers?: { name?: string } | null;
}

export default function PropertyCard({ p, index = 0 }: { p: CardProperty; index?: number }) {
  const { isFav, toggleFav } = useFavorites();
  const fav = isFav(p.id);
  const amenities = (p as unknown as { property_amenities?: unknown[] }).property_amenities;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group bg-white border border-ink/10 hover:border-gold/60 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] transition-all duration-300 overflow-hidden"
    >
      <Link to={`/properties/${p.slug}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={p.cover_image || '/images/tower-a.jpg'}
          alt={`${p.title} — ${p.locality}, ${p.city}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {p.status && <span className="bg-ink/85 backdrop-blur text-white text-[10px] tracking-[0.18em] uppercase px-2.5 py-1">{p.status}</span>}
          {p.featured && <span className="bg-gold text-ink text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 font-semibold flex items-center gap-1"><Star size={10} /> Featured</span>}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleFav(p.id); }}
          aria-label="Save home"
          className={`absolute top-3 right-3 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center backdrop-blur transition active:scale-95 ${fav ? 'bg-gold text-ink' : 'bg-ink/50 text-white hover:bg-gold hover:text-ink'}`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="font-serif text-white text-xl sm:text-2xl">{formatINR(p.price)}</span>
          {p.property_type && <span className="text-white/80 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase shrink-0">{p.property_type}</span>}
        </div>
      </Link>
      <div className="p-5">
        <Link to={`/properties/${p.slug}`}>
          <h3 className="font-serif text-lg text-ink leading-snug group-hover:text-gold-dark transition line-clamp-1">{p.title}</h3>
        </Link>
        <div className="flex items-center gap-1.5 text-ink/55 text-sm mt-1.5">
          <MapPin size={14} className="text-gold-dark shrink-0" />
          <span className="truncate">{p.locality}{p.city ? `, ${p.city}` : ''}</span>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-ink/10 text-sm text-ink/70">
          {p.bedrooms != null && <span className="flex items-center gap-1.5"><BedDouble size={16} className="text-gold-dark" /> {p.bedrooms} BHK</span>}
          {p.bathrooms != null && <span className="flex items-center gap-1.5"><Bath size={16} className="text-gold-dark" /> {p.bathrooms}</span>}
          {p.area_sqft != null && <span className="flex items-center gap-1.5"><Ruler size={16} className="text-gold-dark" /> {p.area_sqft.toLocaleString('en-IN')} sq.ft</span>}
        </div>
        {(p.rera_approved || (Array.isArray(amenities) && amenities.length > 0)) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {p.rera_approved && <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5"><ShieldCheck size={12} /> MahaRERA</span>}
            {p.projects?.name && <span className="text-[11px] text-ink/50 bg-ink/5 px-2 py-0.5 truncate max-w-full">{p.projects.name}</span>}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-ink/10 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-ink/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-ink/10 w-3/4" />
        <div className="h-4 bg-ink/10 w-1/2" />
        <div className="h-4 bg-ink/10 w-full" />
      </div>
    </div>
  );
}
