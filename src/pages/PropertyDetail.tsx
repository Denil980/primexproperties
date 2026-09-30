import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Bath, Ruler, MapPin, Heart, ShieldCheck, ChevronLeft, ChevronRight, X, Share2, Phone, CalendarDays, Compass, Building2, BadgeCheck, Loader2, ArrowLeft, Check } from 'lucide-react';
import SEO, { realEstateSchema } from '../components/SEO';
import PropertyCard, { type CardProperty } from '../components/PropertyCard';
import LeadFormModal from '../components/LeadFormModal';
import SiteVisitModal from '../components/SiteVisitModal';
import { apiGet, apiMut, formatINR, formatINRFull, trackEvent } from '../lib/api';
import { useFavorites } from '../components/FavoritesContext';

export default function PropertyDetail() {
  const { slug } = useParams();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gIdx, setGIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [similar, setSimilar] = useState<CardProperty[]>([]);
  const [shared, setShared] = useState(false);
  const { isFav, toggleFav } = useFavorites();

  // EMI calc
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    apiGet(`/api/properties?slug=${encodeURIComponent(slug)}`)
      .then((d) => {
        setP(d);
        trackEvent('property_view', { property_id: d.id });
        apiMut('/api/properties', 'PATCH', { id: d.id, op: 'view' }).catch(() => {});
        const loc = d.locality ? `&localities=${encodeURIComponent(d.locality)}` : '';
        apiGet(`/api/properties?limit=3${loc}`).then((r) => setSimilar((r.data || []).filter((x: CardProperty) => x.id !== d.id).slice(0, 3))).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  const gallery = useMemo(() => {
    if (!p) return [];
    const imgs = (p.property_images || []).slice().sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((i: any) => i.image_url);
    const all = [p.cover_image, ...imgs].filter(Boolean);
    return Array.from(new Set(all));
  }, [p]);

  const amenities = useMemo(() => (p?.property_amenities || []).map((x: any) => x.amenities).filter(Boolean), [p]);

  const emi = useMemo(() => {
    const price = Number(p?.price || 0);
    const principal = price * (1 - downPct / 100);
    const r = rate / 1200;
    const n = tenure * 12;
    if (!principal || !r || !n) return { emi: 0, principal, interest: 0 };
    const e = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi: Math.round(e), principal, interest: Math.round(e * n - principal) };
  }, [p?.price, downPct, rate, tenure]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.title, url });
      else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); }
    } catch { /* dismissed */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-24">
        <Loader2 className="animate-spin text-gold-dark" size={36} />
      </div>
    );
  }

  if (notFound || !p) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <SEO title="Property not found" />
        <div className="font-serif text-3xl text-ink">This residence is no longer listed</div>
        <p className="text-ink/55 mt-2">It may have been sold — but we have 50+ more for you.</p>
        <Link to="/properties" className="mt-6 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">Browse homes</Link>
      </div>
    );
  }

  const perSqft = p.price && p.area_sqft ? Math.round(p.price / p.area_sqft) : null;

  return (
    <div className="bg-cream min-h-screen">
      <SEO
        title={`${p.bedrooms ? `${p.bedrooms} BHK ` : ''}${p.property_type || 'Home'} in ${p.locality}, ${p.city} — ${formatINR(p.price)}`}
        description={`${p.title} — ${p.bedrooms} BHK ${p.property_type} for ${p.listing_type === 'Rent' ? 'rent' : 'sale'} in ${p.locality}, ${p.city}. ${p.area_sqft} sq.ft at ${formatINR(p.price)}${p.rera_approved ? '. MahaRERA approved' : ''}. Book a site visit with Primex Properties.`}
        keywords={`best properties in ${p.locality}, ${p.bedrooms} BHK ${p.locality}, flats in ${p.locality}, ${p.city} real estate, MahaRERA ${p.locality}`}
        image={p.cover_image}
        schema={realEstateSchema({ name: p.title, description: `${p.bedrooms} BHK ${p.property_type} in ${p.locality}, ${p.city}`, url: window.location.href, image: p.cover_image, price: p.price, locality: p.locality, city: p.city })}
      />

      {/* Gallery hero */}
      <div className="bg-ink pt-24 lg:pt-28 pb-6 px-4 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Link to="/properties" className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase mb-4"><ArrowLeft size={14} /> Back to all homes</Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-auto lg:h-[520px]">
            <div className="lg:col-span-2 relative overflow-hidden cursor-zoom-in group h-[320px] lg:h-auto" onClick={() => { setGIdx(0); setLightbox(true); }}>
              <img src={gallery[0] || '/images/tower-a.jpg'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 flex gap-2">
                {p.status && <span className="bg-ink/85 text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">{p.status}</span>}
                {p.listing_type === 'Rent' && <span className="bg-gold text-ink text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-semibold">For Rent</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[1, 2].map((i) => gallery[i] ? (
                <div key={i} className="relative overflow-hidden cursor-zoom-in group h-[150px] lg:h-auto" onClick={() => { setGIdx(i); setLightbox(true); }}>
                  <img src={gallery[i]} alt={`${p.title} photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ) : null)}
              {gallery.length > 3 && (
                <div className="relative overflow-hidden cursor-zoom-in group h-[150px] lg:h-auto" onClick={() => { setGIdx(3); setLightbox(true); }}>
                  <img src={gallery[3]} alt="More photos" loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-ink/70 flex items-center justify-center text-white text-sm tracking-[0.2em] uppercase">+{gallery.length - 3} photos</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-ink/10 p-6 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-gold-dark text-xs tracking-[0.25em] uppercase"><MapPin size={13} /> {p.locality}, {p.city}</div>
                <h1 className="font-serif text-ink text-2xl lg:text-4xl mt-2 leading-tight">{p.title}</h1>
                <p className="text-ink/50 text-sm mt-2">{p.address}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleFav(p.id)} className={`w-11 h-11 border flex items-center justify-center transition ${isFav(p.id) ? 'bg-gold border-gold text-ink' : 'border-ink/15 text-ink/60 hover:border-gold hover:text-gold-dark'}`} title="Save">
                  <Heart size={18} fill={isFav(p.id) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={share} className="w-11 h-11 border border-ink/15 flex items-center justify-center text-ink/60 hover:border-gold hover:text-gold-dark transition" title="Share">
                  {shared ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2 mt-6 pt-6 border-t border-ink/10">
              <div>
                <div className="text-[11px] tracking-[0.25em] uppercase text-ink/45">{p.listing_type === 'Rent' ? 'Monthly rent' : 'Price'}</div>
                <div className="font-serif text-ink text-3xl lg:text-4xl">{formatINRFull(p.price)}{p.listing_type === 'Rent' && <span className="text-base text-ink/50">/mo</span>}</div>
              </div>
              {perSqft && p.listing_type !== 'Rent' && <div className="text-ink/55 text-sm pb-1.5">₹{perSqft.toLocaleString('en-IN')} per sq.ft</div>}
              {p.rera_approved && <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 mb-1"><ShieldCheck size={14} /> MahaRERA Approved{p.rera_number ? ` · ${p.rera_number}` : ''}</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink/10 border border-ink/10 mt-6">
              {[
                { icon: BedDouble, v: p.bedrooms != null ? `${p.bedrooms} BHK` : '—', l: 'Bedrooms' },
                { icon: Bath, v: p.bathrooms ?? '—', l: 'Bathrooms' },
                { icon: Ruler, v: p.area_sqft ? `${Number(p.area_sqft).toLocaleString('en-IN')}` : '—', l: 'Sq.ft Carpet' },
                { icon: Compass, v: p.facing || '—', l: 'Facing' },
              ].map((s) => (
                <div key={s.l} className="bg-white p-4 text-center">
                  <s.icon size={19} className="mx-auto text-gold-dark" />
                  <div className="font-serif text-lg text-ink mt-1.5">{s.v}</div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-ink/45">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-ink/10 p-6 lg:p-8">
            <h2 className="font-serif text-ink text-2xl">About this residence</h2>
            <p className="text-ink/65 mt-3 leading-relaxed font-light whitespace-pre-line">{p.description || 'A premium Primex-curated residence. Contact our advisors for the full dossier, floor plans and price sheet.'}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-6 pt-6 border-t border-ink/10 text-sm">
              {[
                ['Property type', p.property_type], ['Furnishing', p.furnishing], ['Floor', p.floor_no != null ? `${p.floor_no} of ${p.total_floors || '—'}` : null],
                ['Possession', p.possession_date], ['Facing', p.facing], ['Parking', p.parking],
                ['Project', p.projects?.name], ['Developer', p.developers?.name || p.projects?.developers?.name],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><span className="text-ink/45 text-xs tracking-widest uppercase">{k}</span><div className="text-ink mt-0.5">{v}</div></div>
              ))}
            </div>
          </div>

          {amenities.length > 0 && (
            <div className="bg-white border border-ink/10 p-6 lg:p-8">
              <h2 className="font-serif text-ink text-2xl">Amenities & Lifestyle</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {amenities.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2.5 bg-cream border border-ink/10 px-3.5 py-2.5 text-sm text-ink/75">
                    <BadgeCheck size={15} className="text-gold-dark shrink-0" /> {a.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.projects && (
            <div className="bg-ink text-white p-6 lg:p-8 flex flex-col sm:flex-row gap-5 items-start">
              {p.projects.cover_image && <img src={p.projects.cover_image} alt={p.projects.name} className="w-full sm:w-44 h-32 object-cover shrink-0" loading="lazy" />}
              <div className="flex-1">
                <div className="text-gold text-[10px] tracking-[0.3em] uppercase flex items-center gap-1.5"><Building2 size={12} /> Part of project</div>
                <Link to={`/projects/${p.projects.slug}`} className="font-serif text-2xl hover:text-gold transition">{p.projects.name}</Link>
                <p className="text-white/55 text-sm mt-1">{p.projects.locality}, {p.projects.city} · {p.projects.status}{p.projects.rera_number ? ` · RERA ${p.projects.rera_number}` : ''}</p>
                <Link to={`/projects/${p.projects.slug}`} className="inline-block mt-3 text-xs tracking-[0.2em] uppercase border-b border-gold text-gold pb-0.5">View project</Link>
              </div>
            </div>
          )}

          {/* EMI */}
          {p.listing_type !== 'Rent' && (
            <div className="bg-white border border-ink/10 p-6 lg:p-8">
              <h2 className="font-serif text-ink text-2xl">Home Loan Estimator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className="text-xs tracking-widest uppercase text-ink/50">Down payment · {downPct}%</label>
                  <input type="range" min={10} max={60} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="w-full mt-2 accent-[#b98a2f]" />
                  <div className="text-sm text-ink/70 mt-1">{formatINR(Number(p.price) * downPct / 100)}</div>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-ink/50">Interest · {rate}%</label>
                  <input type="range" min={7} max={12} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2 accent-[#b98a2f]" />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-ink/50">Tenure · {tenure} yrs</label>
                  <input type="range" min={5} max={30} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2 accent-[#b98a2f]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink/10 border border-ink/10 mt-5">
                <div className="bg-ink text-center p-4"><div className="text-[10px] tracking-[0.25em] uppercase text-gold">Monthly EMI</div><div className="font-serif text-gold text-2xl mt-1">{formatINRFull(emi.emi)}</div></div>
                <div className="bg-white text-center p-4"><div className="text-[10px] tracking-[0.25em] uppercase text-ink/45">Loan amount</div><div className="font-serif text-ink text-xl mt-1">{formatINR(emi.principal)}</div></div>
                <div className="bg-white text-center p-4"><div className="text-[10px] tracking-[0.25em] uppercase text-ink/45">Total interest</div><div className="font-serif text-ink text-xl mt-1">{formatINR(emi.interest)}</div></div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-ink text-white p-6 lg:sticky lg:top-28">
            <div className="text-gold text-[10px] tracking-[0.3em] uppercase">Interested in this home?</div>
            <div className="font-serif text-2xl mt-1.5">Talk to an advisor</div>
            <p className="text-white/55 text-sm mt-2 font-light">Get the price sheet, floor plan & best negotiated offer within 30 minutes.</p>
            <button onClick={() => setLeadOpen(true)} className="w-full mt-5 bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.18em] uppercase hover:bg-white transition">Request Best Price</button>
            <button onClick={() => setVisitOpen(true)} className="w-full mt-3 border border-white/25 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition flex items-center justify-center gap-2"><CalendarDays size={16} /> Schedule Site Visit</button>
            <a href="tel:+912248900000" className="w-full mt-3 border border-white/25 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition flex items-center justify-center gap-2"><Phone size={16} /> 022 4890 0000</a>
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3">
              <div className="w-11 h-11 bg-gold/15 text-gold flex items-center justify-center font-serif text-xl">A</div>
              <div className="text-sm"><div className="text-white">Aarav Mehta</div><div className="text-white/45 text-xs">Senior Luxury Advisor · 9 yrs</div></div>
            </div>
          </div>
          <div className="bg-white border border-ink/10 p-6">
            <h3 className="text-xs tracking-[0.25em] uppercase text-ink/50">Why Primex</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink/70">
              {['MahaRERA verification included', 'Zero-pressure advisory', 'Home-loan & registration desk', 'Post-handover support'].map((t) => (
                <li key={t} className="flex gap-2"><Check size={15} className="text-emerald-600 shrink-0 mt-0.5" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 lg:px-10 pb-16">
          <h2 className="font-serif text-ink text-2xl lg:text-3xl mb-6">Similar homes in {p.locality}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similar.map((s, i) => <PropertyCard key={s.id} p={s} index={i} />)}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] bg-ink/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-gold"><X size={28} /></button>
          <button onClick={(e) => { e.stopPropagation(); setGIdx((gIdx - 1 + gallery.length) % gallery.length); }} className="absolute left-3 lg:left-8 text-white/70 hover:text-gold p-2"><ChevronLeft size={36} /></button>
          <img src={gallery[gIdx]} alt={`Photo ${gIdx + 1}`} className="max-h-[85vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setGIdx((gIdx + 1) % gallery.length); }} className="absolute right-3 lg:right-8 text-white/70 hover:text-gold p-2"><ChevronRight size={36} /></button>
          <div className="absolute bottom-5 text-white/60 text-sm tracking-widest">{gIdx + 1} / {gallery.length}</div>
        </motion.div>
      )}

      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} propertyId={p.id} title={`Enquire: ${p.title}`} />
      <SiteVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} propertyId={p.id} propertyTitle={p.title} />

      {/* Mobile sticky CTA bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink/95 backdrop-blur border-t border-gold/30 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] grid grid-cols-3 gap-2">
        <a href="tel:+912248900000" className="flex flex-col items-center justify-center gap-1 border border-white/25 text-white py-2.5 text-[10px] tracking-[0.15em] uppercase min-h-[52px]">
          <Phone size={16} className="text-gold" /> Call
        </a>
        <button onClick={() => setVisitOpen(true)} className="flex flex-col items-center justify-center gap-1 border border-white/25 text-white py-2.5 text-[10px] tracking-[0.15em] uppercase min-h-[52px]">
          <CalendarDays size={16} className="text-gold" /> Visit
        </button>
        <button onClick={() => setLeadOpen(true)} className="flex flex-col items-center justify-center gap-1 bg-gold text-ink font-semibold py-2.5 text-[10px] tracking-[0.15em] uppercase min-h-[52px]">
          <BadgeCheck size={16} /> Enquire
        </button>
      </div>
      <div className="lg:hidden h-[76px]" />
    </div>
  );
}
