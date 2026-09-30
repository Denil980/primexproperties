import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { CITY_AREAS } from '../lib/api';

const BUDGETS = [
  { label: 'Any budget', min: '', max: '' },
  { label: 'Under ₹75 L', min: '', max: '7500000' },
  { label: '₹75 L – ₹1.2 Cr', min: '7500000', max: '12000000' },
  { label: '₹1.2 – ₹2 Cr', min: '12000000', max: '20000000' },
  { label: '₹2 – ₹3.5 Cr', min: '20000000', max: '35000000' },
  { label: '₹3.5 Cr +', min: '35000000', max: '' },
];

export default function HeroSearch() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [keyword, setKeyword] = useState('');

  const search = () => {
    const p = new URLSearchParams();
    if (city) p.set('city', city);
    if (locality) p.set('locality', locality);
    if (bhk) p.set('bedrooms', bhk);
    const b = BUDGETS[budgetIdx];
    if (b.min) p.set('min_price', b.min);
    if (b.max) p.set('max_price', b.max);
    if (keyword.trim()) p.set('search', keyword.trim());
    navigate(`/properties?${p.toString()}`);
  };

  const sel = 'appearance-none w-full bg-white/10 border border-white/15 text-white text-sm px-4 py-3.5 pr-9 focus:outline-none focus:border-gold cursor-pointer [&>option]:text-ink';

  return (
    <div className="bg-ink/60 backdrop-blur-xl border border-white/15 p-4 md:p-5">
      <div className="flex items-center gap-2 text-gold text-[11px] tracking-[0.3em] uppercase mb-3">
        <MapPin size={13} /> Discover your address
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-1">
          <select value={city} onChange={(e) => { setCity(e.target.value); setLocality(''); }} className={sel}>
            <option value="">All Cities</option>
            {Object.keys(CITY_AREAS).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
        </div>
        <div className="relative lg:col-span-1">
          <select value={locality} onChange={(e) => setLocality(e.target.value)} className={sel}>
            <option value="">All Localities</option>
            {(city ? CITY_AREAS[city] : Object.values(CITY_AREAS).flat()).map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={bhk} onChange={(e) => setBhk(e.target.value)} className={sel}>
            <option value="">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="5">5+ BHK</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={budgetIdx} onChange={(e) => setBudgetIdx(Number(e.target.value))} className={sel}>
            {BUDGETS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
        </div>
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Project, tower, keyword…" className="bg-white/10 border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/40 focus:outline-none focus:border-gold" />
        <button onClick={search} className="bg-gold text-ink font-semibold text-sm tracking-[0.18em] uppercase py-3.5 hover:bg-white transition flex items-center justify-center gap-2">
          <Search size={16} /> Search
        </button>
      </div>
    </div>
  );
}
