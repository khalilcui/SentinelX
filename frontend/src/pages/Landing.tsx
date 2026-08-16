import { Link } from 'react-router-dom';
import { ShieldHalf, Globe, Network, Search, FileBarChart, Radar } from 'lucide-react';

const FEATURES = [
  { icon: Globe, title: 'Website Assessment', desc: 'Passive SSL, header, cookie and tech-stack analysis with a clear risk score.' },
  { icon: Network, title: 'Network Assessment', desc: 'Host status, open ports and service visibility for systems you own.' },
  { icon: Search, title: 'Threat Intelligence', desc: 'IP, domain, URL and hash lookups pulled into one workspace.' },
  { icon: Radar, title: 'CVE Intelligence', desc: 'Search vendor and product CVEs with CVSS and mitigation notes.' },
  { icon: FileBarChart, title: 'Reporting', desc: 'Executive-ready PDF reports generated from every assessment.' },
  { icon: ShieldHalf, title: 'Knowledge Base', desc: 'OWASP, MITRE ATT&CK and blue-team reference material in-app.' },
];

const STATS = [
  { value: '12k+', label: 'Assessments run' },
  { value: '98.6%', label: 'Uptime' },
  { value: '4.9/5', label: 'Analyst rating' },
];

export function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* animated background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 left-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldHalf className="text-primary" size={24} />
          <span className="text-xl font-semibold tracking-tight">SentinelX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Platform</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="liquid-glass rounded-full px-5 py-2 text-sm text-foreground hover:scale-[1.03] transition-transform"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32">
        <span className="animate-fade-rise mb-6 rounded-full liquid-glass px-4 py-1.5 text-xs text-muted-foreground">
          AI-Powered Cybersecurity Assessment Platform
        </span>
        <h1
          className="animate-fade-rise-delay text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl font-semibold"
        >
          See your attack surface <span className="text-primary">before they do.</span>
        </h1>
        <p className="animate-fade-rise-delay-2 text-muted-foreground text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
          SentinelX runs defensive website and network assessments, threat intelligence
          lookups and CVE research — then turns them into reports your team can act on.
        </p>
        <div className="flex items-center gap-4 mt-10 animate-fade-rise-delay-2">
          <Link
            to="/register"
            className="liquid-glass rounded-full px-8 py-3.5 text-base text-foreground hover:scale-[1.03] transition-transform glow-primary"
          >
            Start Free Assessment
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-border px-8 py-3.5 text-base text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* stats */}
      <section id="stats" className="relative z-10 max-w-4xl mx-auto grid grid-cols-3 gap-6 px-6 pb-24">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <h2 className="text-3xl font-semibold text-center mb-12">Everything a security team needs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface/60 p-6 hover:border-primary/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-medium mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28 text-center">
        <div className="rounded-2xl liquid-glass p-12">
          <h2 className="text-3xl font-semibold mb-3">Ready to see your risk score?</h2>
          <p className="text-muted-foreground mb-8">Create a free account and run your first assessment in minutes.</p>
          <Link
            to="/register"
            className="inline-block rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-base font-medium hover:scale-[1.03] transition-transform"
            style={{ color: '#050816' }}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SentinelX. Defensive security tooling for authorized use only.
      </footer>
    </div>
  );
}
