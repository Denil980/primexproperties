import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-white border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="inline-block">
              <img src="/images/logo.png" alt="PRIMEX PROPERTIES" className="h-9 lg:h-10 w-auto object-contain" />
            </Link>
            <p className="mt-5 text-white/55 text-sm leading-relaxed">Mumbai's most trusted luxury real estate advisory. Curated residences across Mumbai, Navi Mumbai & Thane — every listing MahaRERA verified.</p>
            <div className="flex gap-2.5 mt-5">
              {[Facebook, Instagram, Linkedin, Twitter].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/50 transition"><I size={15} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-gold mb-5">Explore</h4>
            <div className="flex flex-col gap-2.5 text-sm text-white/60">
              <Link to="/properties" className="hover:text-gold transition">All Properties</Link>
              <Link to="/projects" className="hover:text-gold transition">New Projects</Link>
              <Link to="/developers" className="hover:text-gold transition">Top Developers</Link>
              <Link to="/localities" className="hover:text-gold transition">Locality Guides</Link>
              <Link to="/blog" className="hover:text-gold transition">Insights & Blog</Link>
              <Link to="/favorites" className="hover:text-gold transition">Saved Homes</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-gold mb-5">Top Localities</h4>
            <div className="flex flex-col gap-2.5 text-sm text-white/60">
              <Link to="/localities/kharghar" className="hover:text-gold transition">Best Properties in Kharghar</Link>
              <Link to="/localities/belapur" className="hover:text-gold transition">Best Properties in Belapur</Link>
              <Link to="/localities/vashi" className="hover:text-gold transition">Best Properties in Vashi</Link>
              <Link to="/localities/nerul" className="hover:text-gold transition">Flats in Nerul</Link>
              <Link to="/localities/thane-west" className="hover:text-gold transition">Flats in Thane West</Link>
              <Link to="/localities/powai" className="hover:text-gold transition">Luxury Homes in Powai</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-gold mb-5">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-white/60">
              <span className="flex gap-2.5"><MapPin size={16} className="text-gold shrink-0 mt-0.5" /> Primex Tower, CBD Belapur,<br />Navi Mumbai 400614</span>
              <a href="tel:+912248900000" className="flex gap-2.5 hover:text-gold"><Phone size={16} className="text-gold shrink-0" /> +91 22 4890 0000</a>
              <a href="mailto:hello@primexproperties.in" className="flex gap-2.5 hover:text-gold"><Mail size={16} className="text-gold shrink-0" /> hello@primexproperties.in</a>
              <span className="flex gap-2.5 items-start"><ShieldCheck size={16} className="text-gold shrink-0 mt-0.5" /> MahaRERA Agent Reg: A51900000001</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© 2026 Primex Properties. All rights reserved.</span>
          <span className="tracking-wider">MUMBAI · NAVI MUMBAI · THANE</span>
        </div>
      </div>
    </footer>
  );
}
