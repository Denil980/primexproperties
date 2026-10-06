import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

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
            className="fixed inset-0 z-[100] bg-ink/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={modal.type === 'confirm' ? handleCancel : handleConfirm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f4f1ea] border border-ink/20 shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Gold Top Accent Line */}
              <div className="h-1 bg-gradient-to-r from-[#b98a2f] via-[#e5c07b] to-[#b98a2f]" />

              {/* Header */}
              <div className="bg-[#131822] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {modal.type === 'success' ? (
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  ) : modal.type === 'confirm' ? (
                    <HelpCircle size={20} className="text-[#b98a2f] shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="text-[#b98a2f] shrink-0" />
                  )}
                  <h3 className="font-serif text-white text-lg font-medium tracking-wide">{modal.title}</h3>
                </div>
                <button onClick={handleCancel} className="text-white/50 hover:text-gold transition p-1" aria-label="Close dialog">
                  <X size={18} />
                </button>
              </div>

              {/* Message Body */}
              <div className="p-6">
                <p className="text-ink/85 text-sm sm:text-base leading-relaxed">{modal.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-ink/5 border-t border-ink/10 flex items-center justify-end gap-3">
                {modal.type === 'confirm' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-ink/20 text-ink/70 px-5 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase hover:border-ink hover:text-ink transition"
                  >
                    {modal.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={
                    modal.danger
                      ? 'bg-red-600 text-white px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase hover:bg-red-700 transition shadow-sm'
                      : 'bg-ink text-gold px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase hover:bg-gold hover:text-ink transition shadow-sm'
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
    // Fallback if used outside provider
    return {
      showAlert: async (msg: string) => alert(msg),
      showConfirm: async (msg: string) => confirm(msg),
    };
  }
  return ctx;
}
