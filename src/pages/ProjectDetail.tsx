import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Loader2, Building2, CalendarDays, Phone, Ruler } from 'lucide-react';
import SEO from '../components/SEO';
import PropertyCard, { type CardProperty } from '../components/PropertyCard';
import LeadFormModal from '../components/LeadFormModal';
import { apiGet, formatINR } from '../lib/api';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiGet(`/api/projects?slug=${encodeURIComponent(slug)}`).then(setPr).catch(() => setPr(null)).finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-gold-dark" size={32} /></div>;
  if (!pr) return <div className="min-h-screen bg-cream flex flex-col items-center justify-center"><SEO title="Project not found" /><div className="font-serif text-3xl text-ink">Project not found</div><Link to="/projects" className="mt-5 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">All projects</Link></div>;

  return (
    <div className="bg-cream min-h-screen">
      <SEO title={`${pr.name} — ${pr.locality}, ${pr.city}`} description={`${pr.name} by ${pr.developers?.name} in ${pr.locality}, ${pr.city}. ${pr.configurations} from ${formatINR(pr.price_min)}. ${pr.rera_status === 'Approved' ? `MahaRERA approved (${pr.rera_number}).` : ''} Get launch price & floor plans.`} image={pr.cover_image} />
      <div className="relative h-[52vh] min-h-[380px]">
        <img src={pr.cover_image || '/images/tower-b.jpg'} alt={pr.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-5 lg:px-10 pb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase mb-4"><ArrowLeft size={14} /> All projects</Link>
          <div className="flex items-center gap-1.5 text-gold text-xs tracking-[0.25em] uppercase"><MapPin size={13} /> {pr.locality}, {pr.city}</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">{pr.name}</h1>
          <p className="text-white/65 mt-2">by {pr.developers?.name} · {pr.status} · {pr.configurations}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-ink/10 p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="bg-ink text-gold text-[11px] tracking-[0.2em] uppercase px-3 py-1.5">{pr.status}</span>
              {pr.rera_status === 'Approved'
                ? <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5"><ShieldCheck size={13} /> MahaRERA Approved{pr.rera_number ? ` · ${pr.rera_number}` : ''}</span>
                : <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5">RERA: {pr.rera_status || 'Applied'}</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink/10 border border-ink/10 mt-6">
              {[
                { icon: Building2, v: pr.total_units || '—', l: 'Units' },
                { icon: Ruler, v: pr.tower_count ? `${pr.tower_count} Towers` : '—', l: 'Scale' },
                { icon: CalendarDays, v: pr.possession_date || '—', l: 'Possession' },
                { icon: MapPin, v: pr.configurations?.split(',')[0] || '—', l: 'Configs' },
              ].map((s) => (
                <div key={s.l} className="bg-white p-4 text-center">
                  <s.icon size={18} className="mx-auto text-gold-dark" />
                  <div className="font-serif text-base text-ink mt-1.5 truncate">{s.v}</div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-ink/45">{s.l}</div>
                </div>
              ))}
            </div>
            <h2 className="font-serif text-ink text-2xl mt-7">About this project</h2>
            <p className="text-ink/65 mt-3 leading-relaxed font-light whitespace-pre-line">{pr.description || 'A landmark Primex-partnered development. Request the full brochure, price sheet and payment plan from our advisory desk.'}</p>
            {pr.amenities_text && (
              <>
                <h3 className="font-serif text-ink text-xl mt-6">Amenities</h3>
                <p className="text-ink/65 mt-2 text-sm leading-relaxed">{pr.amenities_text}</p>
              </>
            )}
          </div>

          {pr.units?.length > 0 && (
            <div>
              <h2 className="font-serif text-ink text-2xl mb-5">Available residences in {pr.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {pr.units.map((u: CardProperty, i: number) => <PropertyCard key={u.id} p={u} index={i} />)}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-ink text-white p-6 lg:sticky lg:top-28">
            <div className="text-gold text-[10px] tracking-[0.3em] uppercase">Price range</div>
            <div className="font-serif text-3xl mt-1">{formatINR(pr.price_min)} – {formatINR(pr.price_max)}</div>
            <div className="text-white/50 text-sm mt-1">{pr.configurations}</div>
            <button onClick={() => setLeadOpen(true)} className="w-full mt-5 bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.18em] uppercase hover:bg-white transition">Get Price Sheet</button>
            <a href="tel:+912248900000" className="w-full mt-3 border border-white/25 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition flex items-center justify-center gap-2"><Phone size={15} /> 022 4890 0000</a>
            <p className="text-[11px] text-white/40 mt-4 text-center">Launch inventory moves fast — preferred allotments for Primex clients.</p>
          </div>
        </div>
      </div>

      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} projectId={pr.id} title={`Enquire: ${pr.name}`} />
    </div>
  );
}
