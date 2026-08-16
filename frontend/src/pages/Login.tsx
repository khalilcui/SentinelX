import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldHalf, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <ShieldHalf className="text-primary" size={26} />
          <span className="text-xl font-semibold">SentinelX</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/70 p-8">
          <h1 className="text-2xl font-semibold mb-1 text-center">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sign in to your SentinelX workspace
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-border"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-sm font-medium py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ color: '#050816' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
