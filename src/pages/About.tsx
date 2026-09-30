import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import CountUp from '../components/CountUp';

const TEAM = [
  { n: 'Rohan Khanna', r: 'Founder & Principal Broker', e: 'Ex-Lodha · 18 yrs in MMR luxury' },
  { n: 'Sneha Iyer', r: 'Head of Advisory, Navi Mumbai', e: '4,000+ families housed · Kharghar expert' },
  { n: 'Aarav Mehta', r: 'Senior Luxury Advisor', e: 'Powai–Thane corridor specialist' },
  { n: 'Farah Sheikh', r: 'Head of RERA & Closures', e: 'Zero-failure registration desk' },
];

const VALUES = [
  { icon: ShieldCheck, t: 'RERA-first, always', d: 'If a project doesn\'t clear our 42-point diligence, we don\'t list it. Simple.' },
  { icon: Users, t: 'Advisors, not closers', d: 'Our team is salaried + satisfaction-bonused. No pushy targets, no spam.' },
  { icon: TrendingUp, t: 'Data over hype', d: 'Every recommendation backed by registry data, rental comps and infra timelines.' },
  { icon: Award, t: 'Concierge till keys — and after', d: 'Loans, registration, interiors, resale. One relationship manager for life.' },
];

export default function About() {
  const [img] = useState('/images/villa-a.jpg');
  return (
    <div className="bg-cream min-h-screen">
      <SEO title="About Primex Properties — Mumbai's Trusted Luxury Realty Advisory" description="Primex Properties since 2012: ₹2,400 Cr+ homes sold, 4,000+ families housed across Mumbai, Navi Mumbai & Thane. RERA-first advisory with white-glove concierge." />
      <div className="relative h-[52vh] min-h-[400px]">
        <img src={img} alt="Primex luxury villa" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-5 lg:px-10 pb-10">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Since 2012</div>
          <h1 className="font-serif text-white text-4xl lg:text-6xl mt-2">The advisory behind<br />MMR's finest addresses</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.35em] uppercase">Our story</div>
          <h2 className="font-serif text-ink text-3xl mt-3 leading-tight">Born in Belapur. Trusted across the Mumbai Metropolitan Region.</h2>
          <p className="text-ink/65 mt-5 font-light leading-relaxed">Primex Properties began in 2012 as a two-desk advisory in CBD Belapur with a radical idea: that buying a home in Mumbai shouldn't require luck, jugaad or blind trust. Fourteen years later, we've guided 4,000+ families into homes worth over ₹2,400 crore — from first 1 BHKs in Kharghar to sea-facing penthouses in Worli.</p>
          <p className="text-ink/65 mt-4 font-light leading-relaxed">Today our 40-person team spans research, RERA diligence, negotiation, home-loan syndication and a zero-failure registration desk. Every listing on this platform has passed our 42-point verification — title, approvals, carpet area, possession history and developer financials.</p>
          <div className="grid grid-cols-3 gap-px bg-ink/10 border border-ink/10 mt-8">
            {[['₹2,400 Cr+', 'Homes sold'], ['4,000+', 'Families housed'], ['4.9 / 5', 'Google rating']].map(([v, l]) => (
              <div key={l} className="bg-white p-5 text-center"><div className="font-serif text-ink text-xl lg:text-2xl"><CountUp value={v} /></div><div className="text-[10px] tracking-[0.25em] uppercase text-ink/45 mt-1">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <motion.div key={v.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white border border-ink/10 p-6">
              <v.icon size={24} className="text-gold-dark" />
              <h3 className="font-serif text-ink text-lg mt-3">{v.t}</h3>
              <p className="text-ink/55 text-sm mt-2 font-light leading-relaxed">{v.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-16">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Leadership</div>
          <h2 className="font-serif text-3xl lg:text-4xl mt-2">Meet the partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {TEAM.map((t, i) => (
              <motion.div key={t.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="border border-white/10 p-6 hover:border-gold/50 transition">
                <div className="w-12 h-12 bg-gold/15 text-gold flex items-center justify-center font-serif text-2xl">{t.n[0]}</div>
                <h3 className="font-serif text-xl mt-4">{t.n}</h3>
                <div className="text-gold text-xs tracking-[0.2em] uppercase mt-1">{t.r}</div>
                <div className="text-white/50 text-sm mt-2 font-light">{t.e}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 text-white/50 text-sm">
            <CheckCircle2 size={17} className="text-gold shrink-0" />
            MahaRERA Agent Registration: A51900000001 · Member, NAR India · ISO 9001:2015 certified processes
          </div>
        </div>
      </div>
    </div>
  );
}
