import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ShieldCheck, Award, KeyRound, TrendingUp, Quote, Phone, ChevronLeft, ChevronRight, Building2, MapPinned, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import HeroSearch from '../components/HeroSearch';
import PropertyCard, { PropertyCardSkeleton, type CardProperty } from '../components/PropertyCard';
import LeadFormModal from '../components/LeadFormModal';
import CountUp from '../components/CountUp';
import { apiGet, formatINR, trackEvent } from '../lib/api';

const STATS = [
  { icon: KeyRound, value: '₹2,400 Cr+', label: 'Homes Sold' },
  { icon: Building2, value: '50+', label: 'Curated Listings' },
  { icon: MapPinned, value: '24+', label: 'Prime Localities' },
  { icon: Award, value: '14 Yrs', label: 'MMR Expertise' },
];

const LOCALITY_CARDS = [
  { slug: 'kharghar', name: 'Kharghar', img: '/images/tower-c.jpg', tag: 'Best properties in Kharghar', desc: 'Navi Mumbai\'s education & golf-course hub' },
  { slug: 'belapur', name: 'Belapur', img: '/images/tower-a.jpg', tag: 'Best properties in Belapur', desc: 'The CBD crown with sea-link access' },
  { slug: 'vashi', name: 'Vashi', img: '/images/hero-skyline.jpg', tag: 'Best properties in Vashi', desc: 'MMR\'s most connected address' },
  { slug: 'thane-west', name: 'Thane West', img: '/images/thane-lake.jpg', tag: 'Lake-city luxury living', desc: 'Lakeside towers & high-street life' },
];

export default function Home() {
  const [featured, setFeatured] = useState<CardProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    trackEvent('page_view', { page: '/' });
    Promise.all([
      apiGet('/api/properties?featured=true&limit=6').catch(() => ({ data: [] })),
      apiGet('/api/projects?featured=true&limit=3').catch(() => ({ data: [] })),
      apiGet('/api/testimonials?approved=true&limit=6').catch(() => []),
      apiGet('/api/blog?published=true&limit=3').catch(() => []),
    ]).then(([f, pr, t, b]) => {
      setFeatured(f.data || []);
      setProjects(pr.data || []);
      setTestimonials(t || []);
      setPosts(b || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!testimonials.length) return;
    const id = setInterval(() => setTIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  return (
    <div className="bg-cream">
      <SEO
        title="Primex Properties | Best Properties in Kharghar, Belapur, Vashi & Thane"
        description="Primex Properties — Mumbai's premium real estate platform. Discover the best properties in Kharghar, Belapur, Vashi, Nerul & Thane West. MahaRERA-verified flats, villas & penthouses across Mumbai, Navi Mumbai & Thane."
        keywords="best properties in Kharghar, best properties in Belapur, best properties in Vashi, flats in Nerul, luxury homes Thane West, MahaRERA verified properties Navi Mumbai, Primex Properties"
        schema={{ '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Primex Properties', areaServed: ['Mumbai', 'Navi Mumbai', 'Thane'], telephone: '+91-22-4890-0000', address: { '@type': 'PostalAddress', addressLocality: 'CBD Belapur', addressRegion: 'Maharashtra', addressCountry: 'IN' } }}
      />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline poster="/images/hero-skyline.jpg" className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-10 pt-32 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-flex items-center gap-2 border border-gold/40 bg-ink/50 backdrop-blur px-4 py-1.5 text-gold text-[11px] tracking-[0.3em] uppercase">
            <Sparkles size={12} /> MahaRERA Verified · Est. 2012
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="font-serif text-white text-4xl sm:text-6xl lg:text-[5.2rem] leading-[1.05] mt-6">
            Own the Address.<br /><span className="text-gold italic font-light">Live the Skyline.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-white/70 max-w-2xl mx-auto mt-6 text-base lg:text-lg font-light leading-relaxed">
            Mumbai's most trusted luxury advisory for the finest residences across Mumbai, Navi Mumbai & Thane — from the best properties in Kharghar to sea-facing icons in Worli.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }} className="max-w-5xl mx-auto mt-10 text-left">
            <HeroSearch />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 text-white/60 text-xs tracking-[0.2em] uppercase">
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-gold" /> 100% RERA Verified</span>
            <span className="flex items-center gap-2"><TrendingUp size={14} className="text-gold" /> Zero Brokerage Options</span>
            <span className="flex items-center gap-2"><KeyRound size={14} className="text-gold" /> End-to-End Concierge</span>
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-ink border-y border-gold/20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center text-gold shrink-0"><s.icon size={20} /></div>
              <div>
                <div className="font-serif text-white text-2xl lg:text-3xl"><CountUp value={s.value} /></div>
                <div className="text-white/50 text-[11px] tracking-[0.25em] uppercase mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-gold-dark text-[11px] tracking-[0.35em] uppercase">Handpicked for you</div>
            <h2 className="font-serif text-ink text-3xl lg:text-5xl mt-3">Featured Residences</h2>
            <p className="text-ink/55 mt-3 max-w-xl font-light">A rotating curation of the finest flats, villas and penthouses — including the best properties in Belapur, Vashi and Kharghar.</p>
          </div>
          <Link to="/properties" className="group inline-flex items-center gap-2 border border-ink/20 px-6 py-3 text-sm tracking-[0.15em] uppercase hover:bg-ink hover:text-gold hover:border-ink transition shrink-0">
            View all 50+ homes <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? [1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} />) : featured.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="bg-ink text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[560px]">
            <img src="/images/lobby-a.jpg" alt="Primex luxury lobby" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/40" />
          </div>
          <div className="px-6 lg:px-14 py-14 lg:py-24 flex flex-col justify-center">
            <div className="text-gold text-[11px] tracking-[0.35em] uppercase">The Primex Standard</div>
            <h2 className="font-serif text-3xl lg:text-5xl mt-4 leading-tight">White-glove advisory for <span className="italic text-gold">once-in-a-decade</span> decisions</h2>
            <div className="mt-8 space-y-6">
              {[
                { t: 'RERA-first curation', d: 'Every project cross-verified on MahaRERA — title, approvals, carpet area & possession history.' },
                { t: 'Off-market access', d: 'Pre-launch allotments and distress deals from 40+ partner developers across MMR.' },
                { t: 'Negotiation & closure desk', d: 'Stamp-duty optimisation, home-loan syndication and registration handled in-house.' },
              ].map((f, i) => (
                <motion.div key={f.t} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                  <div className="font-serif text-gold text-2xl">0{i + 1}</div>
                  <div>
                    <h3 className="font-medium tracking-wide">{f.t}</h3>
                    <p className="text-white/55 text-sm mt-1 font-light leading-relaxed">{f.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={() => setLeadOpen(true)} className="bg-gold text-ink px-8 py-3.5 text-sm tracking-[0.18em] uppercase font-semibold hover:bg-white transition">Book Free Consultation</button>
              <a href="tel:+912248900000" className="border border-white/25 px-8 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition flex items-center gap-2"><Phone size={15} /> 022 4890 0000</a>
            </div>
          </div>
        </div>
      </section>

      {/* LOCALITIES */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-gold-dark text-[11px] tracking-[0.35em] uppercase">Neighbourhood guides</div>
          <h2 className="font-serif text-ink text-3xl lg:text-5xl mt-3">Explore Prime Localities</h2>
          <p className="text-ink/55 mt-3 font-light">Data-rich guides to MMR's most rewarding micro-markets — prices, connectivity, schools and upcoming infrastructure.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LOCALITY_CARDS.map((l, i) => (
            <motion.div key={l.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={`/localities/${l.slug}`} className="group relative block h-[420px] overflow-hidden">
                <img src={l.img} alt={l.tag} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-gold text-[10px] tracking-[0.3em] uppercase">{l.tag}</div>
                  <h3 className="font-serif text-white text-3xl mt-1.5">{l.name}</h3>
                  <p className="text-white/60 text-sm mt-1 font-light">{l.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-white text-xs tracking-[0.2em] uppercase mt-4 border-b border-gold pb-1 group-hover:gap-3 transition-all">Explore <ArrowUpRight size={14} /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROJECTS STRIP */}
      <section className="bg-white border-y border-ink/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-gold-dark text-[11px] tracking-[0.35em] uppercase">New launches</div>
              <h2 className="font-serif text-ink text-3xl lg:text-5xl mt-3">Signature Projects</h2>
            </div>
            <Link to="/projects" className="hidden sm:inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-ink/70 hover:text-gold-dark transition">All projects <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((pr, i) => (
              <motion.div key={pr.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/projects/${pr.slug}`} className="group block">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img src={pr.cover_image || '/images/tower-b.jpg'} alt={pr.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    {pr.rera_status === 'Approved' && <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 flex items-center gap-1"><ShieldCheck size={11} /> RERA Approved</span>}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="font-serif text-white text-xl">{formatINR(pr.price_min)} – {formatINR(pr.price_max)}</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-[11px] tracking-[0.25em] uppercase text-gold-dark">{pr.locality}, {pr.city}</div>
                    <h3 className="font-serif text-ink text-2xl mt-1 group-hover:text-gold-dark transition">{pr.name}</h3>
                    <div className="text-ink/50 text-sm mt-1">{pr.developers?.name} · {pr.status} · {pr.total_units} units</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink text-white relative overflow-hidden">
        <Quote size={220} className="absolute -top-6 left-8 text-white/[0.04]" />
        <div className="max-w-4xl mx-auto px-5 lg:px-10 py-20 lg:py-28 text-center relative">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Client stories</div>
          <h2 className="font-serif text-3xl lg:text-5xl mt-3">Trusted by 4,000+ Families</h2>
          {testimonials.length > 0 && (
            <div className="mt-10 min-h-[190px]">
              <motion.blockquote key={tIdx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-xl lg:text-2xl font-light leading-relaxed text-white/85 italic">
                "{testimonials[tIdx].content}"
              </motion.blockquote>
              <div className="mt-6 text-gold tracking-[0.2em] uppercase text-xs">{testimonials[tIdx].name} · {testimonials[tIdx].locality}</div>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={() => setTIdx((tIdx - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition"><ChevronLeft size={17} /></button>
                <span className="text-white/40 text-xs tracking-widest">{tIdx + 1} / {testimonials.length}</span>
                <button onClick={() => setTIdx((tIdx + 1) % testimonials.length)} className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition"><ChevronRight size={17} /></button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BLOG */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-gold-dark text-[11px] tracking-[0.35em] uppercase">Market intelligence</div>
            <h2 className="font-serif text-ink text-3xl lg:text-5xl mt-3">Insights & Guides</h2>
          </div>
          <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-ink/70 hover:text-gold-dark transition">All articles <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((b) => (
            <Link key={b.id} to={`/blog/${b.slug}`} className="group bg-white border border-ink/10 hover:border-gold/60 hover:shadow-xl transition overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={b.cover_image || '/images/living-a.jpg'} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{b.category}</div>
                <h3 className="font-serif text-lg text-ink mt-2 leading-snug group-hover:text-gold-dark transition line-clamp-2">{b.title}</h3>
                <p className="text-ink/50 text-sm mt-2 line-clamp-2 font-light">{b.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src="/images/penthouse-a.jpg" alt="Luxury penthouse terrace" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="relative max-w-3xl mx-auto px-5 py-20 lg:py-28 text-center">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Begin your search</div>
          <h2 className="font-serif text-white text-3xl lg:text-5xl mt-4 leading-tight">Tell us your dream address.<br />We'll handle everything else.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => setLeadOpen(true)} className="bg-gold text-ink px-8 py-3.5 text-sm tracking-[0.18em] uppercase font-semibold hover:bg-white transition">Get a Callback</button>
            <Link to="/properties" className="border border-white/30 text-white px-8 py-3.5 text-sm tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition">Browse Homes</Link>
          </div>
        </div>
      </section>

      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </div>
  );
}
