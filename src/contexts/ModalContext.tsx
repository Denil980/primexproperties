import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface ModalOptions {
  title?: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success';
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ModalContextType {
  showAlert: (message: string, title?: string, type?: 'alert' | 'success') => Promise<void>;
  showConfirm: (message: string, title?: string, danger?: boolean) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<(ModalOptions & { resolve: (val: any) => void }) | null>(null);

  const showAlert = (message: string, title = 'Notice', type: 'alert' | 'success' = 'alert') => {
    return new Promise<void>((resolve) => {
      setModal({ message, title, type, confirmText: 'OK', resolve });
    });
  };

  const showConfirm = (message: string, title = 'Confirm Action', danger = true) => {
    return new Promise<boolean>((resolve) => {
      setModal({ message, title, type: 'confirm', confirmText: danger ? 'Delete' : 'Confirm', cancelText: 'Cancel', danger, resolve });
    });
  };

  const handleConfirm = () => {
    if (modal) {
      const res = modal.resolve;
      setModal(null);
      res(true);
    }
  };

  const handleCancel = () => {
    if (modal) {
      const res = modal.resolve;
      setModal(null);
      res(false);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={modal.type === 'confirm' ? handleCancel : handleConfirm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#131822] border border-[#b98a2f]/40 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] w-full max-w-md overflow-hidden relative"
            >
              {/* Gold Top Accent Line */}
              <div className="h-1 w-full bg-gradient-to-r from-[#b98a2f] via-[#f3e5ab] to-[#b98a2f]" />

              {/* Header with Close Button */}
              <div className="pt-6 px-6 pb-2 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1b2230] to-[#0d1017] border border-[#b98a2f]/30 flex items-center justify-center shadow-inner shrink-0">
                    {modal.type === 'success' ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : modal.danger ? (
                      <ShieldAlert size={22} className="text-red-400" />
                    ) : modal.type === 'confirm' ? (
                      <HelpCircle size={22} className="text-[#b98a2f]" />
                    ) : (
                      <AlertCircle size={22} className="text-[#b98a2f]" />
                    )}
                  </div>
                  <div>
                    <div className="text-gold text-[10px] tracking-[0.3em] uppercase font-mono font-medium">
                      {modal.danger ? 'Confirmation Required' : modal.type === 'success' ? 'Notification' : 'Notice'}
                    </div>
                    <h3 className="font-serif text-white text-xl font-medium tracking-wide mt-0.5">{modal.title}</h3>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-white/40 hover:text-gold transition p-1.5 rounded-lg hover:bg-white/5"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Message Body */}
              <div className="px-6 py-4">
                <p className="text-white/85 text-sm sm:text-base leading-relaxed font-sans font-normal">
                  {modal.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-[#0c0f16] border-t border-white/10 flex items-center justify-end gap-3">
                {modal.type === 'confirm' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-white/20 text-white/70 px-5 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:border-gold hover:text-gold transition"
                  >
                    {modal.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={
                    modal.danger
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:from-red-500 hover:to-red-600 transition shadow-lg shadow-red-900/30'
                      : 'bg-gradient-to-r from-[#b98a2f] via-[#d4af37] to-[#b98a2f] text-ink px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase rounded-lg hover:from-white hover:to-white transition shadow-lg shadow-gold/20'
                  }
                >
                  {modal.confirmText || 'OK'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return {
      showAlert: async (msg: string) => alert(msg),
      showConfirm: async (msg: string) => confirm(msg),
    };
  }
  return ctx;
}
