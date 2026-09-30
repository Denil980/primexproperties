import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Train, GraduationCap, TrendingUp, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import PropertyCard, { type CardProperty } from '../components/PropertyCard';
import LeadFormModal from '../components/LeadFormModal';
import { getLocality } from '../data/localities';
import { apiGet } from '../lib/api';

export default function LocalityDetail() {
  const { slug } = useParams();
  const loc = getLocality(slug);
  const [props, setProps] = useState<CardProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadOpen, setLeadOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!loc) { setLoading(false); return; }
    setLoading(true);
    apiGet(`/api/properties?locality=${encodeURIComponent(loc.name)}&limit=6`).then((r) => setProps(r.data || [])).catch(() => setProps([])).finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loc) {
    return <div className="min-h-screen bg-cream flex flex-col items-center justify-center"><SEO title="Locality not found" /><div className="font-serif text-3xl text-ink">Guide not found</div><Link to="/localities" className="mt-5 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">All guides</Link></div>;
  }

  return (
    <div className="bg-cream min-h-screen">
      <SEO
        title={`${loc.tagline}`}
        description={`${loc.tagline}. ${loc.name} property prices ${loc.priceRange}, avg ${loc.avgPrice}. Explore MahaRERA-verified flats, connectivity, schools & investment outlook with Primex Properties.`}
        keywords={`best properties in ${loc.name}, flats in ${loc.name}, ${loc.name} property prices, ${loc.name} real estate, MahaRERA ${loc.name}`}
        image={loc.image}
        schema={{ '@context': 'https://schema.org', '@type': 'Article', headline: loc.tagline, image: loc.image, author: { '@type': 'Organization', name: 'Primex Properties' }, about: { '@type': 'Place', name: `${loc.name}, ${loc.city}` } }}
      />
      <div className="relative h-[54vh] min-h-[420px]">
        <img src={loc.image} alt={loc.tagline} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-5 lg:px-10 pb-9">
          <Link to="/localities" className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase mb-4"><ArrowLeft size={14} /> All guides</Link>
          <div className="flex items-center gap-1.5 text-gold text-xs tracking-[0.25em] uppercase"><MapPin size={13} /> {loc.city}</div>
          <h1 className="font-serif text-white text-3xl lg:text-6xl mt-2 max-w-3xl leading-tight">{loc.tagline}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        {/* price strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
          {[
            { l: 'Average price', v: loc.avgPrice },
            { l: 'Typical range', v: loc.priceRange },
            { l: 'Gross rental yield', v: loc.rentalYield },
          ].map((s) => (
            <div key={s.l} className="bg-white p-5 text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink/45">{s.l}</div>
              <div className="font-serif text-ink text-2xl mt-1.5">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-8">
            <article className="bg-white border border-ink/10 p-6 lg:p-9">
              <h2 className="font-serif text-ink text-2xl lg:text-3xl">Why {loc.name}?</h2>
              {loc.intro.map((para, i) => (
                <p key={i} className={`text-ink/65 leading-relaxed font-light ${i === 0 ? 'mt-4 first-letter:font-serif first-letter:text-5xl first-letter:text-gold-dark first-letter:mr-2 first-letter:float-left first-letter:leading-none' : 'mt-4'}`}>{para}</p>
              ))}
            </article>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-ink/10 p-6">
                <h3 className="flex items-center gap-2 font-serif text-xl text-ink"><Train size={19} className="text-gold-dark" /> Connectivity</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink/65 font-light">
                  {loc.connectivity.map((c) => <li key={c} className="flex gap-2.5"><span className="text-gold-dark mt-1">◆</span> {c}</li>)}
                </ul>
              </div>
              <div className="bg-white border border-ink/10 p-6">
                <h3 className="flex items-center gap-2 font-serif text-xl text-ink"><GraduationCap size={19} className="text-gold-dark" /> Lifestyle & Social Infra</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink/65 font-light">
                  {loc.highlights.map((c) => <li key={c} className="flex gap-2.5"><span className="text-gold-dark mt-1">◆</span> {c}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-ink/10 p-6 lg:p-9">
              <h2 className="font-serif text-ink text-2xl flex items-center gap-2"><HelpCircle size={22} className="text-gold-dark" /> {loc.name} FAQs</h2>
              <div className="mt-5 space-y-3">
                {loc.faqs.map((f, i) => (
                  <div key={i} className="border border-ink/10">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-5 py-4 font-medium text-ink flex justify-between items-center gap-3">
                      {f.q}
                      <span className={`text-gold-dark text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {openFaq === i && <p className="px-5 pb-5 text-sm text-ink/60 font-light leading-relaxed">{f.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-ink text-white p-6 lg:sticky lg:top-28">
              <div className="text-gold text-[10px] tracking-[0.3em] uppercase flex items-center gap-1.5"><TrendingUp size={12} /> {loc.name} outlook</div>
              <div className="font-serif text-xl mt-2 leading-snug">Strong buy — infra-led growth corridor</div>
              <p className="text-white/55 text-sm mt-2 font-light">Primex advisory desk tracks every RERA filing in {loc.name}. Get the full price-trend report free.</p>
              <button onClick={() => setLeadOpen(true)} className="w-full mt-5 bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.18em] uppercase hover:bg-white transition">Get {loc.name} Report</button>
              <Link to={`/properties?locality=${encodeURIComponent(loc.name)}`} className="w-full mt-3 border border-white/25 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition flex items-center justify-center gap-2">Browse {loc.name} homes <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-serif text-ink text-2xl lg:text-3xl">Live listings in {loc.name}</h2>
            <Link to={`/properties?locality=${encodeURIComponent(loc.name)}`} className="hidden sm:inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-ink/70 hover:text-gold-dark">View all <ArrowRight size={15} /></Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-14"><Loader2 className="animate-spin text-gold-dark" size={30} /></div>
          ) : props.length === 0 ? (
            <div className="bg-white border border-ink/10 p-10 text-center text-ink/60">New {loc.name} inventory lands every week — <button onClick={() => setLeadOpen(true)} className="text-gold-dark underline">ask us for off-market options</button>.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {props.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} title={`${loc.name} Price Report`} />
    </div>
  );
}
