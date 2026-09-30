import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Loader2, Smartphone, Mail, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'email' | 'phone';

function safeReturnTo(path: string | null): string | null {
  if (!path || typeof path !== 'string') return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//') || path.includes('://')) return null;
  return path;
}

export default function Login() {
  const [params] = useSearchParams();
  const location = useLocation();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const { user, isStaff, loading: authLoading } = useAuth();

  const fromState = (location.state as { from?: string; reason?: string } | null) || {};
  const returnTo = safeReturnTo(fromState.from || params.get('returnTo'));
  const reason = fromState.reason || (returnTo ? 'Sign in to continue — you’ll be back in a moment.' : '');

  useEffect(() => {
    if (authLoading || !user) return;
    // Post-login: same page if provided; staff landing in console, customers home.
    if (returnTo) navigate(returnTo, { replace: true });
    else navigate(isStaff ? '/admin' : '/', { replace: true });
  }, [user, authLoading, isStaff, navigate, returnTo]);

  const normalizePhone = (p: string) => {
    const d = p.replace(/\D/g, '');
    if (d.length === 10) return '+91' + d;
    if (d.length === 12 && d.startsWith('91')) return '+' + d;
    if (p.trim().startsWith('+')) return p.trim();
    return null;
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() || email.split('@')[0] } } });
        if (error) throw error;
        setInfo('Account created — check your email to verify, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const to = normalizePhone(phone);
    if (!to) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: to });
      if (error) throw error;
      setOtpSent(true);
      setInfo(`OTP sent to ${to}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP. Please try email instead.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const to = normalizePhone(phone);
    if (!to || otp.trim().length < 4) { setError('Enter the OTP sent to your phone.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: to, token: otp.trim(), type: 'sms' });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-gold transition';

  return (
    <div className="min-h-screen bg-ink flex">
      <SEO title={mode === 'signup' ? 'Create your Primex account' : 'Sign in to Primex Properties'} />
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="/images/lobby-a.jpg" alt="Primex luxury" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-ink" />
        <div className="absolute bottom-14 left-12 right-12">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Members get more</div>
          <div className="font-serif text-white text-4xl mt-3 leading-tight">Save homes, track visits,<br />unlock off-market deals.</div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-28">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block">
            <img src="/images/logo.png" alt="PRIMEX PROPERTIES" className="h-9 lg:h-10 w-auto object-contain" />
          </Link>
          <h1 className="font-serif text-white text-3xl mt-8">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-white/50 text-sm mt-2">
            {mode === 'signup' ? 'Join 4,000+ families house-hunting smarter.' : 'Sign in to your saved homes & visits.'}{' '}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setInfo(''); }} className="text-gold hover:underline">{mode === 'signup' ? 'Sign in' : 'Create account'}</button>
          </p>
          {reason && <p className="mt-3 text-sm text-gold/90 bg-gold/10 border border-gold/25 px-4 py-2.5">{reason}</p>}

          <button onClick={() => signInWithGoogle('Primex Properties')} className="w-full mt-7 bg-white text-ink py-3 text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-cream transition">
            <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
            Continue with Google
          </button>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <button onClick={() => { setTab('email'); setError(''); setInfo(''); }} className={`flex items-center justify-center gap-2 py-2.5 text-xs tracking-[0.18em] uppercase border transition ${tab === 'email' ? 'bg-gold/15 border-gold/50 text-gold' : 'border-white/15 text-white/60 hover:border-gold/40'}`}>
              <Mail size={13} /> Email
            </button>
            <button onClick={() => { setTab('phone'); setError(''); setInfo(''); }} className={`flex items-center justify-center gap-2 py-2.5 text-xs tracking-[0.18em] uppercase border transition ${tab === 'phone' ? 'bg-gold/15 border-gold/50 text-gold' : 'border-white/15 text-white/60 hover:border-gold/40'}`}>
              <Smartphone size={13} /> Phone OTP
            </button>
          </div>

          {tab === 'email' ? (
            <form onSubmit={submitEmail} className="space-y-4 mt-5">
              {mode === 'signup' && <input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
              <input className={inputCls} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <input className={inputCls} placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {info && <p className="text-emerald-400 text-sm">{info}</p>}
              <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="mt-5">
              {!otpSent ? (
                <form onSubmit={sendOtp} className="space-y-4">
                  <div className="flex">
                    <span className="bg-white/10 border border-r-0 border-white/15 px-3.5 flex items-center text-white/70 text-sm">+91</span>
                    <input className={inputCls + ' !border-l-0'} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} autoComplete="tel" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  {info && <p className="text-emerald-400 text-sm">{info}</p>}
                  <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Sending…' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <input className={inputCls + ' text-center tracking-[0.5em] text-lg'} placeholder="••••••" inputMode="numeric" maxLength={8} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  {info && <p className="text-emerald-400 text-sm">{info}</p>}
                  <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Verifying…' : 'Verify & Sign In'}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); setInfo(''); }} className="w-full text-white/50 text-xs tracking-widest uppercase hover:text-gold transition">Use a different number</button>
                </form>
              )}
            </div>
          )}

          <div className="mt-7 flex items-start gap-2.5 text-white/35 text-xs leading-relaxed">
            <ShieldCheck size={15} className="shrink-0 mt-0.5 text-gold/60" />
            <span>Browsing is always free — sign-in is only needed to save homes, track visits or manage your profile. Sessions expire automatically for your security.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
