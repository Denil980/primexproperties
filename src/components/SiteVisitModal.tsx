import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, CalendarDays } from 'lucide-react';
import { apiMut } from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId?: number | null;
  propertyTitle?: string;
}

const inputCls = 'w-full bg-white border border-ink/15 px-4 py-3.5 sm:py-3 text-base sm:text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition min-h-[52px] sm:min-h-0';
const SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '5:30 PM'];

export default function SiteVisitModal({ open, onClose, propertyId, propertyTitle }: Props) {
  const [form, setForm] = useState({ visitor_name: '', visitor_phone: '', visitor_email: '', visit_date: '', visit_time: '11:00 AM', notes: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.visitor_name.trim() || !form.visitor_phone.trim() || !form.visit_date) { setError('Name, phone and date are required.'); return; }
    setLoading(true);
    try {
      await apiMut('/api/site-visits', 'POST', { ...form, visitor_name: form.visitor_name.trim(), visitor_phone: form.visitor_phone.trim(), visitor_email: form.visitor_email || null, property_id: propertyId || null, source: 'Website Visit', website: website || undefined });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setDone(false); setError(''); onClose(); };
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={close}>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="bg-cream w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-none">
            <div className="bg-ink px-6 py-5 flex items-start justify-between sticky top-0">
              <div>
                <div className="text-gold text-[10px] tracking-[0.35em] uppercase flex items-center gap-2"><CalendarDays size={12} /> Private Tour</div>
                <h3 className="font-serif text-white text-xl mt-1">Schedule a Site Visit</h3>
                {propertyTitle && <p className="text-white/50 text-xs mt-1 truncate">{propertyTitle}</p>}
              </div>
              <button onClick={close} className="text-white/60 hover:text-gold p-1"><X size={20} /></button>
            </div>
            {done ? (
              <div className="p-10 text-center">
                <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
                <h4 className="font-serif text-2xl text-ink mt-4">Visit Scheduled!</h4>
                <p className="text-ink/60 text-sm mt-2">We've reserved <strong>{form.visit_date}</strong> at <strong>{form.visit_time}</strong>. Our advisor will confirm shortly on your phone.</p>
                <button onClick={close} className="mt-6 bg-ink text-white px-8 py-3 text-sm tracking-[0.15em] uppercase hover:bg-gold hover:text-ink transition">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputCls} placeholder="Full name *" value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} />
                  <input className={inputCls} placeholder="Phone *" value={form.visitor_phone} onChange={(e) => setForm({ ...form, visitor_phone: e.target.value })} />
                </div>
                <input className={inputCls} placeholder="Email (optional)" type="email" value={form.visitor_email} onChange={(e) => setForm({ ...form, visitor_email: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-ink/50">Visit date *</label>
                    <input type="date" min={minDate} className={`${inputCls} mt-1`} value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-ink/50">Time slot</label>
                    <select className={`${inputCls} mt-1`} value={form.visit_time} onChange={(e) => setForm({ ...form, visit_time: e.target.value })}>
                      {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <textarea className={inputCls} rows={2} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-ink hover:text-gold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Booking…' : 'Confirm Site Visit'}
                </button>
                <p className="text-[11px] text-ink/45 text-center">Free chauffeured pickup available across Navi Mumbai & Thane.</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
