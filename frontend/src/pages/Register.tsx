import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldHalf, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!accepted) {
      setError('You must accept the terms to continue.');
      return;
    }
    try {
      await register(fullName, email, password);
      navigate('/app/dashboard');
    } catch {
      setError('Could not create account. Try a different email.');
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <ShieldHalf className="text-primary" size={26} />
          <span className="text-xl font-semibold">SentinelX</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/70 p-8">
          <h1 className="text-2xl font-semibold mb-1 text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Start assessing your attack surface today
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Khalil Ahmed"
                  className="w-full rounded-lg bg-white/5 border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg bg-white/5 border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-white/5 border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Confirm</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-white/5 border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="rounded border-border"
              />
              I agree to the Terms of Service and Privacy Policy
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-sm font-medium py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ color: '#050816' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
