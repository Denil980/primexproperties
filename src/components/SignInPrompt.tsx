import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
  title?: string;
  message?: string;
}

// Gentle, dismissible sign-in nudge — never blocks browsing.
export default function SignInPrompt({ open, onClose, onSignIn, title = 'Sign in to continue', message = 'Sign in once to unlock this — browsing stays free forever.' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cream w-full sm:max-w-md p-6 sm:p-7 rounded-t-2xl sm:rounded-none border-t-2 sm:border sm:border-gold/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ink text-gold flex items-center justify-center shrink-0"><Heart size={17} /></div>
                <h3 className="font-serif text-ink text-xl leading-snug">{title}</h3>
              </div>
              <button onClick={onClose} aria-label="Dismiss" className="text-ink/40 hover:text-ink p-1 -m-1"><X size={19} /></button>
            </div>
            <p className="text-ink/60 text-sm mt-3 font-light leading-relaxed">{message}</p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
              <button onClick={onSignIn} className="flex-1 bg-ink text-gold py-3 text-[13px] tracking-[0.18em] uppercase font-semibold hover:bg-gold hover:text-ink transition flex items-center justify-center gap-2">
                Sign In <ArrowRight size={14} />
              </button>
              <button onClick={onClose} className="flex-1 border border-ink/20 text-ink/70 py-3 text-[13px] tracking-[0.18em] uppercase hover:border-ink transition">
                Keep Browsing
              </button>
            </div>
            <p className="text-[11px] text-ink/40 mt-3 text-center">Email, Google, or phone OTP — no spam, ever.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
