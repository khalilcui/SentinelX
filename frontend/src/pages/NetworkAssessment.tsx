import { useState, type FormEvent } from 'react';
import { Network, Loader2, Server, Activity, ShieldQuestion, AlertTriangle } from 'lucide-react';
import { api, type NetworkAssessmentResult } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';

export function NetworkAssessment() {
  const [host, setHost] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NetworkAssessmentResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!authorized) {
      setError('You must confirm you are authorized to test this host before scanning.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<NetworkAssessmentResult>('/assessments/network', {
        target_host: host,
        authorized,
      });
      setResult(data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail[0]?.msg : detail ?? 'Assessment failed. Check the hostname and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Network Assessment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          TCP-connect port check, service/banner detection and response time — for hosts you own or are authorized to test.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface/70 p-6 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Target Host or IP</label>
          <div className="relative">
            <Network size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com or 192.168.1.10"
              className="w-full rounded-lg bg-white/5 border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span>I own this host, or I have explicit authorization to run a security assessment against it.</span>
        </label>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Network size={16} />}
          {loading ? 'Scanning…' : 'Run Assessment'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface/70 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {result.target_host}
                {result.resolved_ip && <span className="text-xs"> · {result.resolved_ip}</span>}
              </p>
              <p className="text-xl font-semibold mt-1">
                Host is{' '}
                <span className={result.host_up === 'up' ? 'text-success' : 'text-critical'}>
                  {result.host_up === 'up' ? 'reachable' : 'unreachable'}
                </span>
              </p>
            </div>
            <RiskBadge score={result.risk_score} level={result.risk_level} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-primary" />
                <h3 className="font-medium text-sm">Response Time</h3>
              </div>
              <p className="text-2xl font-semibold">
                {result.response_time_ms != null ? `${result.response_time_ms} ms` : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Average across open ports</p>
            </div>

            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Server size={16} className="text-primary" />
                <h3 className="font-medium text-sm">Open Ports</h3>
              </div>
              <p className="text-2xl font-semibold">{result.open_ports.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Out of 20 commonly-checked ports</p>
            </div>

            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldQuestion size={16} className="text-primary" />
                <h3 className="font-medium text-sm">Operating System</h3>
              </div>
              <p className="text-lg font-semibold">{result.os_guess.guess}</p>
              <p className="text-xs text-muted-foreground mt-1">{result.os_guess.basis}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/70 p-5">
            <h3 className="font-medium text-sm mb-3">Open Ports &amp; Services</h3>
            {result.open_ports.length === 0 ? (
              <p className="text-xs text-muted-foreground">No commonly-checked ports responded as open.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground text-left border-b border-border">
                      <th className="py-2 pr-4">Port</th>
                      <th className="py-2 pr-4">Service</th>
                      <th className="py-2 pr-4">Response</th>
                      <th className="py-2">Banner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.open_ports.map((p) => (
                      <tr key={p.port} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">{p.port}</td>
                        <td className="py-2 pr-4">{p.service}</td>
                        <td className="py-2 pr-4">{p.response_time_ms} ms</td>
                        <td className="py-2 text-muted-foreground break-all">{p.banner ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface/70 p-5">
            <h3 className="font-medium text-sm mb-3">Recommendations</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              {result.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
