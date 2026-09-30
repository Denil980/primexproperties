import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { apiMut } from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId?: number | null;
  projectId?: number | null;
  title?: string;
  defaultInterest?: string;
}

const inputCls = 'w-full bg-white border border-ink/15 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition min-h-[52px] sm:min-h-0';

export default function LeadFormModal({ open, onClose, propertyId, projectId, title, defaultInterest = 'Buy' }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', budget_max: '', preferred_locality: '' });
  const [interest, setInterest] = useState(defaultInterest);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return; }
    if (!/^[+\d][\d\s-]{7,14}$/.test(form.phone.trim())) { setError('Please enter a valid phone number.'); return; }
    setLoading(true);
    try {
      await apiMut('/api/leads', 'POST', {
        name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null,
        message: form.message.trim() || null, budget_max: form.budget_max ? Number(form.budget_max) : null,
        preferred_locality: form.preferred_locality || null, interest_type: interest,
        property_id: propertyId || null, project_id: projectId || null, source: 'Website Enquiry',
        website: website || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setDone(false); setError(''); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={close}>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="bg-cream w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-none">
            <div className="bg-ink px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between sticky top-0 z-10">
              <div className="min-w-0">
                <div className="text-gold text-[10px] tracking-[0.35em] uppercase">Primex Concierge</div>
                <h3 className="font-serif text-white text-lg sm:text-xl mt-1 leading-snug">{title || 'Request Details & Best Price'}</h3>
              </div>
              <button onClick={close} aria-label="Close" className="text-white/60 hover:text-gold p-2 -m-1 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
            </div>
            {done ? (
              <div className="p-10 text-center">
                <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
                <h4 className="font-serif text-2xl text-ink mt-4">Thank you, {form.name.split(' ')[0]}!</h4>
                <p className="text-ink/60 text-sm mt-2 leading-relaxed">Our luxury property advisor will call you within 30 minutes with the best price, floor plans & site-visit slots.</p>
                <button onClick={close} className="mt-6 bg-ink text-white px-8 py-3 text-sm tracking-[0.15em] uppercase hover:bg-gold hover:text-ink transition">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {['Buy', 'Rent', 'Site Visit', 'Callback'].map((t) => (
                    <button key={t} type="button" onClick={() => setInterest(t)} className={`flex-1 py-2.5 sm:py-2 text-xs tracking-widest uppercase border transition min-h-[44px] sm:min-h-0 ${interest === t ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60 hover:border-gold'}`}>{t}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputCls} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className={inputCls} placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <input className={inputCls} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select className={inputCls} value={form.preferred_locality} onChange={(e) => setForm({ ...form, preferred_locality: e.target.value })}>
                    <option value="">Preferred locality</option>
                    {['Kharghar', 'Belapur', 'Vashi', 'Nerul', 'Seawoods', 'Airoli', 'Thane West', 'Powai', 'Bandra West', 'Worli'].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select className={inputCls} value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })}>
                    <option value="">Budget</option>
                    <option value="7500000">Under ₹75 L</option>
                    <option value="12000000">₹75 L – ₹1.2 Cr</option>
                    <option value="20000000">₹1.2 – ₹2 Cr</option>
                    <option value="35000000">₹2 – ₹3.5 Cr</option>
                    <option value="100000000">₹3.5 Cr+</option>
                  </select>
                </div>
                <textarea className={inputCls} rows={3} placeholder="Message (optional) — e.g. preferred floor, possession timeline…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {/* Honeypot anti-spam field — invisible to humans */}
                <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-ink hover:text-gold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Sending…' : 'Request Callback'}
                </button>
                <p className="text-[11px] text-ink/45 text-center">By submitting, you agree to be contacted by Primex Properties. No spam, ever.</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
