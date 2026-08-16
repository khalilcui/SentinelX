import { useState, type FormEvent } from 'react';
import { Globe, Loader2, ShieldCheck, ShieldX, AlertTriangle, Cookie, FileCode2, Cpu } from 'lucide-react';
import { api, type WebsiteAssessmentResult } from '@/lib/api';
import { RiskBadge } from '@/components/RiskBadge';

export function WebsiteAssessment() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebsiteAssessmentResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post<WebsiteAssessmentResult>('/assessments/website', {
        target_url: url,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Assessment failed. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Website Assessment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Passive, defensive scan — SSL, security headers, cookies, robots.txt and tech fingerprint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface/70 p-6">
        <label className="text-sm text-muted-foreground mb-2 block">Target URL</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg bg-white/5 border border-border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            style={{ color: '#050816' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Scanning…' : 'Run Assessment'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Only assess domains you own or are explicitly authorized to test.
        </p>
      </form>

      {error && (
        <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface/70 p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="text-lg font-medium">{result.target_url}</div>
            </div>
            <RiskBadge score={result.risk_score} level={result.risk_level} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ResultCard title="SSL Certificate" icon={ShieldCheck} data={result.ssl_info as unknown as Record<string, unknown>} />
            <ResultCard
              title="Security Headers"
              icon={ShieldX}
              data={{
                score: `${result.security_headers.score}/100`,
                present: Object.keys(result.security_headers.present).join(', ') || 'None',
                missing: result.security_headers.missing.map((m) => m.header).join(', ') || 'None',
              }}
            />
            <ResultCard
              title="Cookie Security"
              icon={Cookie}
              data={{
                cookies_found: result.cookie_security.cookies_found,
                issues: result.cookie_security.issues.length === 0 ? 'None' : `${result.cookie_security.issues.length} cookie(s) with missing flags`,
              }}
            />
            <ResultCard title="robots.txt" icon={FileCode2} data={{ found: result.robots_txt.found, url: result.robots_txt.url }} />
            <ResultCard title="sitemap.xml" icon={FileCode2} data={{ found: result.sitemap_xml.found, url: result.sitemap_xml.url }} />
            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={16} className="text-primary" />
                <h3 className="font-medium text-sm">Technology Stack</h3>
              </div>
              {Object.keys(result.tech_stack).length === 0 ? (
                <p className="text-xs text-muted-foreground">No technologies detected from headers.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.tech_stack).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-white/5 border border-border px-2.5 py-1 text-xs">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/70 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              <h3 className="font-medium text-sm">Recommendations</h3>
            </div>
            {result.recommendations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No issues found — great posture.</p>
            ) : (
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-warning">•</span> {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: typeof ShieldCheck;
  data: Record<string, unknown>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-primary" />
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      <dl className="space-y-1.5">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs gap-4">
            <dt className="text-muted-foreground">{key.replace(/_/g, ' ')}</dt>
            <dd className="text-foreground text-right break-all">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
