import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import PropertyCard, { type CardProperty } from '../components/PropertyCard';
import { apiGet, formatINR } from '../lib/api';

export default function DeveloperDetail() {
  const { slug } = useParams();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiGet(`/api/developers?slug=${encodeURIComponent(slug)}`).then(setD).catch(() => setD(null)).finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-gold-dark" size={32} /></div>;
  if (!d) return <div className="min-h-screen bg-cream flex flex-col items-center justify-center"><SEO title="Developer not found" /><div className="font-serif text-3xl text-ink">Developer not found</div><Link to="/developers" className="mt-5 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">All developers</Link></div>;

  return (
    <div className="bg-cream min-h-screen">
      <SEO title={`${d.name} — Projects & Track Record`} description={`${d.name} (${d.hq}) — ${d.projects_delivered || ''} projects delivered. Explore ${d.name} projects & homes across Mumbai, Navi Mumbai & Thane with Primex Properties.`} />
      <div className="bg-ink pt-32 lg:pt-36 pb-10 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Link to="/developers" className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase mb-5"><ArrowLeft size={14} /> All developers</Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gold text-ink flex items-center justify-center font-serif text-3xl lg:text-4xl shrink-0">{d.name?.[0]}</div>
            <div>
              <h1 className="font-serif text-white text-3xl lg:text-5xl">{d.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-white/60 text-sm">
                <span>{d.hq}{d.founded_year ? ` · Est. ${d.founded_year}` : ''}</span>
                {d.rating && <span className="flex items-center gap-1 text-gold"><Star size={14} fill="currentColor" /> {d.rating} Primex rating</span>}
              </div>
            </div>
          </div>
          {(d.projects_delivered || d.ongoing_projects) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 mt-7 max-w-2xl">
              <div className="bg-ink p-4 text-center"><div className="font-serif text-gold text-2xl">{d.projects_delivered || '—'}</div><div className="text-[10px] tracking-[0.25em] uppercase text-white/45">Delivered</div></div>
              <div className="bg-ink p-4 text-center"><div className="font-serif text-gold text-2xl">{d.ongoing_projects || '—'}</div><div className="text-[10px] tracking-[0.25em] uppercase text-white/45">Ongoing</div></div>
              <div className="bg-ink p-4 text-center"><div className="font-serif text-gold text-2xl">{d.projects?.length || '—'}</div><div className="text-[10px] tracking-[0.25em] uppercase text-white/45">Listed here</div></div>
              <div className="bg-ink p-4 text-center"><div className="font-serif text-gold text-2xl">{d.properties?.length || '—'}</div><div className="text-[10px] tracking-[0.25em] uppercase text-white/45">Live homes</div></div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 space-y-12">
        {d.description && (
          <div className="bg-white border border-ink/10 p-6 lg:p-8 max-w-4xl">
            <h2 className="font-serif text-ink text-2xl">About {d.name}</h2>
            <p className="text-ink/65 mt-3 leading-relaxed font-light whitespace-pre-line">{d.description}</p>
          </div>
        )}
        {d.projects?.length > 0 && (
          <div>
            <h2 className="font-serif text-ink text-2xl lg:text-3xl mb-6">Projects by {d.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {d.projects.map((pr: any) => (
                <Link key={pr.id} to={`/projects/${pr.slug}`} className="group bg-white border border-ink/10 hover:border-gold/60 hover:shadow-lg transition overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={pr.cover_image || '/images/tower-b.jpg'} alt={pr.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{pr.locality}, {pr.city}</div>
                    <h3 className="font-serif text-xl text-ink group-hover:text-gold-dark transition">{pr.name}</h3>
                    <div className="text-sm text-ink/55 mt-1">{pr.status} · {formatINR(pr.price_min)}+</div>
                    <span className="inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase mt-3 group-hover:gap-3 transition-all">View <ArrowRight size={13} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {d.properties?.length > 0 && (
          <div>
            <h2 className="font-serif text-ink text-2xl lg:text-3xl mb-6">Homes by {d.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {d.properties.map((u: CardProperty, i: number) => <PropertyCard key={u.id} p={u} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
