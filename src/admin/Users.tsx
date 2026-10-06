import { useEffect, useState } from 'react';
import { Loader2, Trash2, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, timeAgo } from '../lib/api';
import { useAuth, ROLE_LABELS, type Role } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Card, CardHead, Empty, inputCls } from './ui';

const MANAGEABLE_ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'super_admin', label: 'Super Admin', desc: 'Everything incl. role grants' },
  { value: 'admin', label: 'Admin', desc: 'Full console except Super Admin grants' },
  { value: 'sales_manager', label: 'Sales Manager', desc: 'CRM, visits, listings, analytics' },
  { value: 'sales_agent', label: 'Sales Agent', desc: 'CRM, visits, listings' },
  { value: 'content_manager', label: 'Content Manager', desc: 'Listings, blog, SEO, testimonials' },
  { value: 'customer', label: 'Customer', desc: 'Saved homes & visits only' },
];

function UserTable({
  users,
  firstColLabel,
  me,
  isSuperAdmin,
  setRole,
  remove,
}: {
  users: any[];
  firstColLabel: string;
  me: any;
  isSuperAdmin: boolean;
  setRole: (id: number, role: string) => void;
  remove: (id: number) => void;
}) {
  if (users.length === 0) return <Empty text="No accounts found in this section." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-[11px] tracking-[0.15em] uppercase text-ink/45 border-b border-ink/10">
            <th className="px-5 py-3 font-medium">{firstColLabel}</th>
            <th className="px-3 py-3 font-medium">Phone</th>
            <th className="px-3 py-3 font-medium">Joined</th>
            <th className="px-3 py-3 font-medium">Role</th>
            <th className="px-3 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-cream/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-ink text-gold flex items-center justify-center text-sm font-semibold shrink-0">
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      {u.full_name || '—'}{' '}
                      {me?.id === u.id && <ShieldCheck size={13} className="text-gold-dark" />}
                    </div>
                    <div className="text-xs text-ink/45">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-ink/70">{u.phone || '—'}</td>
              <td className="px-3 py-3 text-ink/60">{timeAgo(u.created_at)}</td>
              <td className="px-3 py-3">
                <select
                  value={u.role === 'agent' ? 'sales_agent' : u.role}
                  disabled={me?.id === u.id}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className={inputCls + ' !w-auto !py-1.5 disabled:opacity-50'}
                >
                  {MANAGEABLE_ROLES.filter((r) => r.value !== 'super_admin' || isSuperAdmin).map((r) => (
                    <option key={r.value} value={r.value}>
                      {ROLE_LABELS[r.value]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-3 text-right">
                {me?.id !== u.id && (
                  <button
                    type="button"
                    onClick={() => remove(u.id)}
                    className="p-2 border border-ink/15 text-ink/40 hover:border-red-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsers() {
  const { profile: me, isSuperAdmin } = useAuth();
  const { showConfirm } = useModal();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    apiGet('/api/profiles?list=all').then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setRole = async (id: number, role: string) => {
    setError('');
    try {
      await apiMut('/api/profiles', 'PUT', { id, role });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Role change failed.');
    }
  };

  const remove = async (id: number) => {
    const ok = await showConfirm('Remove this user profile? (Auth account stays, but app access resets.)', 'Remove User Profile');
    if (!ok) return;
    await apiMut('/api/profiles', 'DELETE', { id });
    load();
  };

  const shown = search ? items.filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())) : items;
  const count = (r: string) => items.filter((u) => u.role === r || (r === 'sales_agent' && u.role === 'agent')).length;

  const adminUsers = shown.filter((u) => u.role !== 'customer');
  const customerUsers = shown.filter((u) => u.role === 'customer');

  return (
    <div className="space-y-6">
      <SEO title="Users & Roles" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">Access control · RBAC</div>
          <h1 className="font-serif text-ink text-3xl">Users & Roles <span className="text-lg text-ink/40">({items.length})</span></h1>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className={inputCls + ' !w-56'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {MANAGEABLE_ROLES.map((r) => (
          <Card key={r.value} className="p-4">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink/45">{r.label}</div>
            <div className="font-serif text-2xl text-ink mt-1">{count(r.value)}</div>
            <div className="text-[11px] text-ink/50 mt-1 leading-snug">{r.desc}</div>
          </Card>
        ))}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4">{error}</div>}

      {/* Top Table: Admin's */}
      <Card>
        <CardHead title="Admin's" sub="Administrative, sales & management accounts" />
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div>
        ) : (
          <UserTable
            users={adminUsers}
            firstColLabel="Admin's"
            me={me}
            isSuperAdmin={isSuperAdmin}
            setRole={setRole}
            remove={remove}
          />
        )}
      </Card>

      {/* Bottom Table: Customers */}
      <Card>
        <CardHead title="Customers" sub="Registered property buyers & website visitors" />
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-dark" size={28} /></div>
        ) : (
          <UserTable
            users={customerUsers}
            firstColLabel="User"
            me={me}
            isSuperAdmin={isSuperAdmin}
            setRole={setRole}
            remove={remove}
          />
        )}
      </Card>
    </div>
  );
}
