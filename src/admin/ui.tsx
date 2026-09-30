import { type ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-ink/10 ${className}`}>{children}</div>;
}

export function CardHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ink/10">
      <div>
        <h2 className="font-serif text-lg text-ink">{title}</h2>
        {sub && <p className="text-xs text-ink/50 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] tracking-[0.22em] uppercase text-ink/45">{label}</div>
      <div className="font-serif text-3xl text-ink mt-1.5">{value}</div>
      {sub && <div className="text-xs text-ink/50 mt-1">{sub}</div>}
    </Card>
  );
}

export const inputCls = 'w-full bg-white border border-ink/15 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition';
export const labelCls = 'text-[11px] tracking-[0.18em] uppercase text-ink/50 block mb-1.5';
export const btnPrimary = 'bg-ink text-gold px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-gold hover:text-ink transition disabled:opacity-50';
export const btnGold = 'bg-gold text-ink px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-ink hover:text-gold transition disabled:opacity-50';
export const btnGhost = 'border border-ink/15 px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-ink/70 hover:border-gold hover:text-gold-dark transition disabled:opacity-50';

export function Bar({ pct, color = 'bg-gold' }: { pct: number; color?: string }) {
  return (
    <div className="h-2 bg-ink/10 w-full">
      <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
    Qualified: 'bg-violet-50 text-violet-700 border-violet-200',
    'Site Visit Scheduled': 'bg-gold/10 text-gold-dark border-gold/40',
    'Site Visit Done': 'bg-teal-50 text-teal-700 border-teal-200',
    Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
    Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Lost: 'bg-red-50 text-red-600 border-red-200',
    Scheduled: 'bg-gold/10 text-gold-dark border-gold/40',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Applied: 'bg-amber-50 text-amber-700 border-amber-200',
    Expired: 'bg-red-50 text-red-600 border-red-200',
  };
  return <span className={`inline-block text-[11px] px-2.5 py-1 border whitespace-nowrap ${map[status] || 'bg-ink/5 text-ink/60 border-ink/10'}`}>{status}</span>;
}

export function Empty({ text = 'No records found.' }: { text?: string }) {
  return <div className="px-5 py-12 text-center text-ink/45 text-sm">{text}</div>;
}
