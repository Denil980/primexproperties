import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { apiMut } from '../lib/api';

const inputCls = 'w-full bg-white border border-ink/15 px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest_type: 'Buy', preferred_locality: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return; }
    setLoading(true);
    try {
      await apiMut('/api/leads', 'POST', { name: form.name.trim(), phone: form.phone.trim(), email: form.email || null, interest_type: form.interest_type, preferred_locality: form.preferred_locality || null, message: form.message || null, source: 'Contact Page', website: website || undefined });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Contact Primex Properties — Visit, Call or Request a Callback" description="Visit our CBD Belapur experience centre or call +91 22 4890 0000. Primex Properties serves Mumbai, Navi Mumbai & Thane home buyers 7 days a week, 9am–9pm." />
      <div className="bg-ink pt-32 lg:pt-40 pb-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">We reply within 30 minutes</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Let's find your address</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: MapPin, t: 'Experience Centre', d: 'Primex Tower, Plot 12, Sector 11, CBD Belapur, Navi Mumbai 400614' },
            { icon: Phone, t: 'Call us', d: '+91 22 4890 0000', href: 'tel:+912248900000' },
            { icon: Mail, t: 'Email', d: 'hello@primexproperties.in', href: 'mailto:hello@primexproperties.in' },
            { icon: Clock, t: 'Hours', d: 'Mon–Sun · 9:00 AM – 9:00 PM' },
          ].map((c) => (
            <div key={c.t} className="bg-white border border-ink/10 p-5 flex gap-4">
              <div className="w-11 h-11 bg-ink text-gold flex items-center justify-center shrink-0"><c.icon size={18} /></div>
              <div>
                <div className="text-[11px] tracking-[0.25em] uppercase text-ink/45">{c.t}</div>
                {c.href ? <a href={c.href} className="text-ink mt-1 hover:text-gold-dark transition">{c.d}</a> : <div className="text-ink mt-1">{c.d}</div>}
              </div>
            </div>
          ))}
          <div className="bg-ink text-white p-6">
            <div className="text-gold text-[10px] tracking-[0.3em] uppercase">Prefer WhatsApp?</div>
            <p className="text-white/60 text-sm mt-1.5">Chat with an advisor instantly — floor plans & price sheets in minutes.</p>
            <a href="https://wa.me/912248900000" target="_blank" rel="noreferrer" className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2.5 text-sm tracking-[0.15em] uppercase hover:bg-emerald-500 transition">Chat on WhatsApp</a>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white border border-ink/10 p-6 lg:p-9">
            {done ? (
              <div className="text-center py-10">
                <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
                <h2 className="font-serif text-2xl text-ink mt-4">Message received!</h2>
                <p className="text-ink/55 text-sm mt-2">An advisor will reach out within 30 minutes during working hours.</p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-ink text-2xl">Send an enquiry</h2>
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className={inputCls} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className={inputCls} placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <input className={inputCls} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select className={inputCls} value={form.interest_type} onChange={(e) => setForm({ ...form, interest_type: e.target.value })}>
                      <option>Buy</option><option>Rent</option><option>Site Visit</option><option>Sell / List Property</option><option>Investment Advisory</option>
                    </select>
                    <select className={inputCls} value={form.preferred_locality} onChange={(e) => setForm({ ...form, preferred_locality: e.target.value })}>
                      <option value="">Preferred locality</option>
                      {['Kharghar', 'Belapur', 'Vashi', 'Nerul', 'Seawoods', 'Airoli', 'Thane West', 'Powai', 'Bandra West', 'Worli', 'Other'].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <textarea className={inputCls} rows={5} placeholder="Tell us what you're looking for — budget, BHK, timeline…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button disabled={loading} className="bg-ink text-gold px-10 py-3.5 text-sm tracking-[0.2em] uppercase font-semibold hover:bg-gold hover:text-ink transition flex items-center gap-2 disabled:opacity-60">
                    {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
